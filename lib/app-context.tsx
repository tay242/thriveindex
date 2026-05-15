import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  UserProfile,
  DailyEntry,
  WeeklyEntry,
  getProfile,
  saveProfile,
  getDailyEntry,
  saveDailyEntry,
  getWeeklyEntry,
  saveWeeklyEntry,
  getAllDailyEntries,
  getAllWeeklyEntries,
  calculateDailyScore,
  calculateWeeklyScore,
  recalculateStreak,
  todayString,
  getWeekKey,
  DEFAULT_PROFILE,
  seedDemoData,
} from './store';
import { useNotifications } from '@/hooks/use-notifications';

interface AppContextValue {
  profile: UserProfile;
  todayEntry: DailyEntry | null;
  currentWeekEntry: WeeklyEntry | null;
  allDailyEntries: DailyEntry[];
  allWeeklyEntries: WeeklyEntry[];
  isLoading: boolean;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateTodayEntry: (updates: Partial<DailyEntry>) => Promise<void>;
  updateWeekEntry: (updates: Partial<WeeklyEntry>) => Promise<void>;
  refreshData: () => Promise<void>;
  completeOnboarding: (name: string) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [todayEntry, setTodayEntry] = useState<DailyEntry | null>(null);
  const [currentWeekEntry, setCurrentWeekEntry] = useState<WeeklyEntry | null>(null);
  const [allDailyEntries, setAllDailyEntries] = useState<DailyEntry[]>([]);
  const [allWeeklyEntries, setAllWeeklyEntries] = useState<WeeklyEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { requestPermissions, scheduleMorningReminder } = useNotifications();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [p, daily, weekly, allDaily, allWeekly] = await Promise.all([
        getProfile(),
        getDailyEntry(todayString()),
        getWeeklyEntry(getWeekKey()),
        getAllDailyEntries(),
        getAllWeeklyEntries(),
      ]);
      setProfile(p);
      setTodayEntry(daily);
      setCurrentWeekEntry(weekly);
      setAllDailyEntries(allDaily);
      setAllWeeklyEntries(allWeekly);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    await saveProfile(updates);
    const updated = await getProfile();
    setProfile(updated);
  }, []);

  const updateTodayEntry = useCallback(
    async (updates: Partial<DailyEntry>) => {
      const today = todayString();
      const base: DailyEntry = todayEntry ?? {
        date: today,
        sleepHours: 0,
        steps: 0,
        exerciseMinutes: 0,
        gratitude: '',
        progressNote: '',
        progressCategory: null,
        morningSunlight: null,
        dailyScore: 0,
        completedAt: null,
      };
      const merged = { ...base, ...updates };
      merged.dailyScore = calculateDailyScore(merged, profile.thresholds);
      merged.completedAt = new Date().toISOString();
      await saveDailyEntry(merged);
      setTodayEntry(merged);

      // Update streak
      const { streak, longestStreak } = await recalculateStreak();
      await saveProfile({ streak, longestStreak });
      setProfile((prev) => ({ ...prev, streak, longestStreak }));

      // Refresh all entries
      const all = await getAllDailyEntries();
      setAllDailyEntries(all);
    },
    [todayEntry, profile.thresholds]
  );

  const updateWeekEntry = useCallback(
    async (updates: Partial<WeeklyEntry>) => {
      const weekKey = getWeekKey();
      const base: WeeklyEntry = currentWeekEntry ?? {
        weekKey,
        meaningfulConnection: null,
        contribution: null,
        novelty: null,
        weeklyJournal: '',
        weeklyScore: 0,
        completedAt: null,
      };
      const merged = { ...base, ...updates };
      // Get this week's daily entries for score calc
      const weekDailyEntries = allDailyEntries.slice(-7);
      merged.weeklyScore = calculateWeeklyScore(merged, weekDailyEntries, profile.thresholds);
      merged.completedAt = new Date().toISOString();
      await saveWeeklyEntry(merged);
      setCurrentWeekEntry(merged);

      const all = await getAllWeeklyEntries();
      setAllWeeklyEntries(all);
    },
    [currentWeekEntry, allDailyEntries, profile.thresholds]
  );

  const completeOnboarding = useCallback(async (name: string) => {
    await saveProfile({ onboardingComplete: true, name });
    await seedDemoData(DEFAULT_PROFILE.thresholds);
    await requestPermissions();
    await scheduleMorningReminder();
    await loadData();
  }, [loadData, requestPermissions, scheduleMorningReminder]);

  // Set up notifications on mount
  useEffect(() => {
    requestPermissions();
    if (profile.onboardingComplete) {
      scheduleMorningReminder();
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        profile,
        todayEntry,
        currentWeekEntry,
        allDailyEntries,
        allWeeklyEntries,
        isLoading,
        updateProfile,
        updateTodayEntry,
        updateWeekEntry,
        refreshData: loadData,
        completeOnboarding,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
