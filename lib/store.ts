import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ExtraMetricEntry {
  id: string; // e.g., 'water', 'meditation', or custom UUID
  value: number; // e.g., 8 glasses, 20 minutes
  isCustom?: boolean; // true if user-created
}

export interface DailyEntry {
  date: string; // YYYY-MM-DD
  // Automated metrics (simulated / from Health)
  sleepHours: number;
  steps: number;
  exerciseMinutes: number;
  // Manual reflections
  gratitude: string;
  progressNote: string;
  progressCategory: ProgressCategory | null;
  morningSunlight: boolean | null;
  // Extra metrics
  extraMetrics: ExtraMetricEntry[];
  // Computed
  dailyScore: number;
  completedAt: string | null;
}

export interface WeeklyEntry {
  weekKey: string; // YYYY-WW (ISO week)
  meaningfulConnection: boolean | null;
  contribution: boolean | null;
  novelty: boolean | null;
  weeklyJournal: string;
  weeklyScore: number;
  completedAt: string | null;
}

export interface Thresholds {
  sleepHours: number;
  steps: number;
  exerciseMinutes: number;
}

export interface CustomMetric {
  id: string; // UUID
  name: string;
  unit: string;
  icon: string; // icon name
  defaultTarget: number;
  createdAt: string;
}

export interface UserProfile {
  onboardingComplete: boolean;
  name: string;
  thresholds: Thresholds;
  priorities: ProgressCategory[];
  enabledExtraMetrics: string[]; // IDs of enabled preset metrics
  customMetrics: CustomMetric[];
  streak: number;
  longestStreak: number;
  totalDaysTracked: number;
  joinedDate: string;
  // Notification preferences
  dailyNotificationTime: string; // HH:MM format (e.g., "21:00" for 9 PM)
  weeklyNotificationDay: number; // 0 = Sunday, 6 = Saturday
  weeklyNotificationTime: string; // HH:MM format
}

export type ProgressCategory =
  | 'Health'
  | 'Career'
  | 'Family'
  | 'Financial'
  | 'Personal Growth'
  | 'Relationships';

// ─── Keys ─────────────────────────────────────────────────────────────────────

const KEYS = {
  DAILY_PREFIX: 'daily_',
  WEEKLY_PREFIX: 'weekly_',
  PROFILE: 'user_profile',
  ALL_DAILY_DATES: 'all_daily_dates',
  ALL_WEEKLY_KEYS: 'all_weekly_keys',
};

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const DEFAULT_THRESHOLDS: Thresholds = {
  sleepHours: 7.5,
  steps: 8000,
  exerciseMinutes: 30,
};

export const DEFAULT_PROFILE: UserProfile = {
  onboardingComplete: false,
  name: '',
  thresholds: DEFAULT_THRESHOLDS,
  priorities: ['Health', 'Personal Growth'],
  enabledExtraMetrics: [],
  customMetrics: [],
  streak: 0,
  longestStreak: 0,
  totalDaysTracked: 0,
  joinedDate: new Date().toISOString().split('T')[0],
  dailyNotificationTime: '21:00',
  weeklyNotificationDay: 0,
  weeklyNotificationTime: '09:00',
};

// ─── Score Calculation ────────────────────────────────────────────────────────

export function calculateDailyScore(entry: Partial<DailyEntry>, thresholds: Thresholds): number {
  let score = 0;
  const max = 100;

  // Sleep: 25 pts
  if (entry.sleepHours !== undefined) {
    const sleepScore = Math.min(entry.sleepHours / thresholds.sleepHours, 1.0);
    score += sleepScore * 25;
  }

  // Steps: 25 pts
  if (entry.steps !== undefined) {
    const stepsScore = Math.min(entry.steps / thresholds.steps, 1.0);
    score += stepsScore * 25;
  }

  // Exercise: 20 pts
  if (entry.exerciseMinutes !== undefined) {
    const exScore = Math.min(entry.exerciseMinutes / thresholds.exerciseMinutes, 1.0);
    score += exScore * 20;
  }

  // Morning sunlight: 10 pts
  if (entry.morningSunlight === true) score += 10;

  // Gratitude: 10 pts
  if (entry.gratitude && entry.gratitude.trim().length > 0) score += 10;

  // Progress note: 10 pts
  if (entry.progressNote && entry.progressNote.trim().length > 0) score += 10;

  return Math.round(Math.min(score, max));
}

export function calculateWeeklyScore(
  weekEntry: Partial<WeeklyEntry>,
  dailyEntries: DailyEntry[],
  thresholds: Thresholds
): number {
  let score = 0;

  // Daily consistency (avg daily score): 40 pts
  if (dailyEntries.length > 0) {
    const avgDaily = dailyEntries.reduce((s, e) => s + e.dailyScore, 0) / dailyEntries.length;
    score += (avgDaily / 100) * 40;
  }

  // Weekly habits: 20 pts each
  if (weekEntry.meaningfulConnection === true) score += 20;
  if (weekEntry.contribution === true) score += 20;
  if (weekEntry.novelty === true) score += 20;

  // Weekly journal: 0 pts (bonus feel, not scored to avoid pressure)

  return Math.round(Math.min(score, 100));
}

// ─── Storage Helpers ──────────────────────────────────────────────────────────

export async function getProfile(): Promise<UserProfile> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.PROFILE);
    if (!raw) return { ...DEFAULT_PROFILE };
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

export async function saveProfile(profile: Partial<UserProfile>): Promise<void> {
  const current = await getProfile();
  const updated = { ...current, ...profile };
  await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(updated));
}

export async function getDailyEntry(date: string): Promise<DailyEntry | null> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.DAILY_PREFIX + date);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function saveDailyEntry(entry: DailyEntry): Promise<void> {
  await AsyncStorage.setItem(KEYS.DAILY_PREFIX + entry.date, JSON.stringify(entry));
  // Track all dates
  const raw = await AsyncStorage.getItem(KEYS.ALL_DAILY_DATES);
  const dates: string[] = raw ? JSON.parse(raw) : [];
  if (!dates.includes(entry.date)) {
    dates.push(entry.date);
    dates.sort();
    await AsyncStorage.setItem(KEYS.ALL_DAILY_DATES, JSON.stringify(dates));
  }
}

export async function getAllDailyEntries(): Promise<DailyEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.ALL_DAILY_DATES);
    if (!raw) return [];
    const dates: string[] = JSON.parse(raw);
    const entries = await Promise.all(dates.map((d) => getDailyEntry(d)));
    return entries.filter(Boolean) as DailyEntry[];
  } catch {
    return [];
  }
}

export async function getWeeklyEntry(weekKey: string): Promise<WeeklyEntry | null> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.WEEKLY_PREFIX + weekKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function saveWeeklyEntry(entry: WeeklyEntry): Promise<void> {
  await AsyncStorage.setItem(KEYS.WEEKLY_PREFIX + entry.weekKey, JSON.stringify(entry));
  const raw = await AsyncStorage.getItem(KEYS.ALL_WEEKLY_KEYS);
  const keys: string[] = raw ? JSON.parse(raw) : [];
  if (!keys.includes(entry.weekKey)) {
    keys.push(entry.weekKey);
    keys.sort();
    await AsyncStorage.setItem(KEYS.ALL_WEEKLY_KEYS, JSON.stringify(keys));
  }
}

export async function getAllWeeklyEntries(): Promise<WeeklyEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.ALL_WEEKLY_KEYS);
    if (!raw) return [];
    const keys: string[] = JSON.parse(raw);
    const entries = await Promise.all(keys.map((k) => getWeeklyEntry(k)));
    return entries.filter(Boolean) as WeeklyEntry[];
  } catch {
    return [];
  }
}

// ─── Date Helpers ─────────────────────────────────────────────────────────────

export function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getWeekKey(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

// ─── Streak Calculation ───────────────────────────────────────────────────────

export async function recalculateStreak(): Promise<{ streak: number; longestStreak: number }> {
  const entries = await getAllDailyEntries();
  if (entries.length === 0) return { streak: 0, longestStreak: 0 };

  const completedDates = entries
    .filter((e) => e.dailyScore > 0)
    .map((e) => e.date)
    .sort()
    .reverse();

  if (completedDates.length === 0) return { streak: 0, longestStreak: 0 };

  const today = todayString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Current streak
  let streak = 0;
  let checkDate = completedDates[0] === today ? today : yesterdayStr;

  for (const date of completedDates) {
    if (date === checkDate) {
      streak++;
      const prev = new Date(checkDate + 'T00:00:00');
      prev.setDate(prev.getDate() - 1);
      checkDate = prev.toISOString().split('T')[0];
    } else {
      break;
    }
  }

  // Longest streak
  let longest = 0;
  let current = 1;
  const sorted = [...completedDates].sort();
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + 'T00:00:00');
    prev.setDate(prev.getDate() + 1);
    if (prev.toISOString().split('T')[0] === sorted[i]) {
      current++;
    } else {
      longest = Math.max(longest, current);
      current = 1;
    }
  }
  longest = Math.max(longest, current);

  return { streak, longestStreak: longest };
}

// ─── Seed Demo Data ───────────────────────────────────────────────────────────

export async function seedDemoData(thresholds: Thresholds): Promise<void> {
  const today = new Date();
  const entries: DailyEntry[] = [];

  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    const sleepHours = 6.5 + Math.random() * 2.5;
    const steps = 5000 + Math.floor(Math.random() * 7000);
    const exerciseMinutes = 10 + Math.floor(Math.random() * 50);
    const morningSunlight = Math.random() > 0.4;
    const gratitude = i % 2 === 0 ? 'Had a productive morning and good coffee.' : '';
    const progressNote = i % 3 === 0 ? 'Finished a key project milestone.' : '';
    const progressCategory: ProgressCategory | null = i % 3 === 0 ? 'Career' : null;

    const entry: DailyEntry = {
      date: dateStr,
      sleepHours: Math.round(sleepHours * 10) / 10,
      steps,
      exerciseMinutes,
      morningSunlight,
      gratitude,
      progressNote,
      progressCategory,
      extraMetrics: [],
      dailyScore: 0,
      completedAt: d.toISOString(),
    };
    entry.dailyScore = calculateDailyScore(entry, thresholds);
    entries.push(entry);
  }

  await Promise.all(entries.map((e) => saveDailyEntry(e)));

  // Seed weekly entry for current week
  const weekKey = getWeekKey();
  const existing = await getWeeklyEntry(weekKey);
  if (!existing) {
    const weekEntry: WeeklyEntry = {
      weekKey,
      meaningfulConnection: true,
      contribution: false,
      novelty: true,
      weeklyJournal: 'Good week overall. Stayed consistent with exercise.',
      weeklyScore: 0,
      completedAt: null,
    };
    const weekDailyEntries = entries.slice(-7);
    weekEntry.weeklyScore = calculateWeeklyScore(weekEntry, weekDailyEntries, thresholds);
    await saveWeeklyEntry(weekEntry);
  }
}
