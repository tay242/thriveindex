import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

let Health: any = null;
try {
  Health = require('expo-health');
} catch (e) {
  // expo-health not available in this environment
}

export interface HealthData {
  sleepHours: number;
  steps: number;
  exerciseMinutes: number;
  lastSyncTime: string;
}

const PERMISSIONS = [
  Health.HKQuantityTypeIdentifier.stepCount,
  Health.HKQuantityTypeIdentifier.sleepAnalysis,
  Health.HKWorkoutTypeIdentifier.workout,
];

/**
 * Hook to read HealthKit data from Apple Health on iOS.
 * On Android or web, returns null (not supported).
 * Requires HealthKit entitlement from Apple.
 */
export function useHealthKit() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState(false);

  // Request HealthKit permissions
  const requestPermissions = async () => {
    if (!Health) {
      setError('HealthKit module not available');
      return;
    }
    if (Platform.OS !== 'ios') {
      setError('HealthKit is only available on iOS');
      return;
    }

    try {
      setLoading(true);
      const result = await Health.requestPermissions(PERMISSIONS);
      setAuthorized(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request permissions');
      setAuthorized(false);
    } finally {
      setLoading(false);
    }
  };

  // Fetch today's health data
  const fetchTodayData = async () => {
    if (!Health || Platform.OS !== 'ios') {
      setData(null);
      return;
    }

    try {
      setLoading(true);
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Fetch steps
      const stepsData = await Health.getHKQuantitySampleData(
        Health.HKQuantityTypeIdentifier.stepCount,
        {
          startDate: startOfDay,
          endDate: now,
          ascending: false,
          limit: 1,
        }
      );

      const steps = stepsData.length > 0 ? Math.round(stepsData[0].value) : 0;

      // Fetch sleep (in minutes, convert to hours)
      const sleepData = await Health.getHKQuantitySampleData(
        Health.HKQuantityTypeIdentifier.sleepAnalysis,
        {
          startDate: startOfDay,
          endDate: now,
          ascending: false,
          limit: 1,
        }
      );

      const sleepMinutes = sleepData.length > 0 ? sleepData[0].value : 0;
      const sleepHours = Math.round((sleepMinutes / 60) * 10) / 10;

      // Fetch workouts (in minutes)
      const workoutData = await Health.getHKWorkoutSamples({
        startDate: startOfDay,
        endDate: now,
        ascending: false,
      });

      const exerciseMinutes = workoutData.reduce((sum: number, w: any) => sum + (w.duration || 0), 0);

      setData({
        sleepHours,
        steps,
        exerciseMinutes: Math.round(exerciseMinutes),
        lastSyncTime: now.toISOString(),
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health data');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    authorized,
    requestPermissions,
    fetchTodayData,
  };
}
