import { describe, it, expect } from 'vitest';
import {
  calculateDailyScore,
  calculateWeeklyScore,
  getWeekKey,
  todayString,
  DEFAULT_THRESHOLDS,
  type DailyEntry,
  type WeeklyEntry,
} from '../lib/store';

describe('calculateDailyScore', () => {
  it('returns 0 when all values are 0', () => {
    const entry = {
      sleepHours: 0,
      steps: 0,
      exerciseMinutes: 0,
      morningSunlight: null,
      gratitude: '',
      progressNote: '',
    };
    expect(calculateDailyScore(entry, DEFAULT_THRESHOLDS)).toBe(0);
  });

  it('returns 100 when all thresholds are met and reflections complete', () => {
    const entry = {
      sleepHours: DEFAULT_THRESHOLDS.sleepHours,
      steps: DEFAULT_THRESHOLDS.steps,
      exerciseMinutes: DEFAULT_THRESHOLDS.exerciseMinutes,
      morningSunlight: true,
      gratitude: 'Good day',
      progressNote: 'Made progress',
    };
    expect(calculateDailyScore(entry, DEFAULT_THRESHOLDS)).toBe(100);
  });

  it('gives partial score for partial metrics', () => {
    const entry = {
      sleepHours: DEFAULT_THRESHOLDS.sleepHours / 2, // 50% of sleep
      steps: 0,
      exerciseMinutes: 0,
      morningSunlight: null,
      gratitude: '',
      progressNote: '',
    };
    const score = calculateDailyScore(entry, DEFAULT_THRESHOLDS);
    // 50% of 25 pts = 12.5 -> rounded to 13
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(30);
  });

  it('caps score at 100 even if values exceed thresholds', () => {
    const entry = {
      sleepHours: DEFAULT_THRESHOLDS.sleepHours * 3,
      steps: DEFAULT_THRESHOLDS.steps * 3,
      exerciseMinutes: DEFAULT_THRESHOLDS.exerciseMinutes * 3,
      morningSunlight: true,
      gratitude: 'Great',
      progressNote: 'Excellent',
    };
    expect(calculateDailyScore(entry, DEFAULT_THRESHOLDS)).toBe(100);
  });

  it('awards 10 pts for morning sunlight', () => {
    const base = { sleepHours: 0, steps: 0, exerciseMinutes: 0, gratitude: '', progressNote: '' };
    const withSun = calculateDailyScore({ ...base, morningSunlight: true }, DEFAULT_THRESHOLDS);
    const withoutSun = calculateDailyScore({ ...base, morningSunlight: false }, DEFAULT_THRESHOLDS);
    expect(withSun - withoutSun).toBe(10);
  });
});

describe('calculateWeeklyScore', () => {
  it('returns 0 with no data', () => {
    const weekEntry: Partial<WeeklyEntry> = {};
    expect(calculateWeeklyScore(weekEntry, [], DEFAULT_THRESHOLDS)).toBe(0);
  });

  it('awards 20 pts per completed habit', () => {
    const weekEntry: Partial<WeeklyEntry> = {
      meaningfulConnection: true,
      contribution: false,
      novelty: false,
    };
    const score = calculateWeeklyScore(weekEntry, [], DEFAULT_THRESHOLDS);
    expect(score).toBe(20);
  });

  it('maxes out at 100 with all habits and perfect daily scores', () => {
    const dailyEntries: DailyEntry[] = Array.from({ length: 7 }, (_, i) => ({
      date: `2024-01-0${i + 1}`,
      sleepHours: DEFAULT_THRESHOLDS.sleepHours,
      steps: DEFAULT_THRESHOLDS.steps,
      exerciseMinutes: DEFAULT_THRESHOLDS.exerciseMinutes,
      morningSunlight: true,
      gratitude: 'Good',
      progressNote: 'Done',
      progressCategory: null,
      extraMetrics: [],
      dailyScore: 100,
      completedAt: null,
    }));
    const weekEntry: Partial<WeeklyEntry> = {
      meaningfulConnection: true,
      contribution: true,
      novelty: true,
    };
    const score = calculateWeeklyScore(weekEntry, dailyEntries, DEFAULT_THRESHOLDS);
    expect(score).toBe(100);
  });
});

describe('date helpers', () => {
  it('todayString returns YYYY-MM-DD format', () => {
    const today = todayString();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('getWeekKey returns YYYY-WXX format', () => {
    const key = getWeekKey(new Date('2024-01-15'));
    expect(key).toMatch(/^\d{4}-W\d{2}$/);
  });

  it('getWeekKey is consistent for same week', () => {
    const monday = new Date('2024-01-15');
    const sunday = new Date('2024-01-21');
    expect(getWeekKey(monday)).toBe(getWeekKey(sunday));
  });
});
