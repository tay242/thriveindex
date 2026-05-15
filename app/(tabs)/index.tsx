import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { StreakCelebration } from '@/components/streak-celebration';
import { useColors } from '@/hooks/use-colors';
import { useApp } from '@/lib/app-context';
import { useHealthKit } from '@/hooks/use-health-kit';
import { ProgressCategory, formatDate, todayString } from '@/lib/store';
import * as Haptics from 'expo-haptics';
import Svg, { Circle } from 'react-native-svg';

const CATEGORIES: ProgressCategory[] = [
  'Health', 'Career', 'Family', 'Financial', 'Personal Growth', 'Relationships',
];

// ─── Score Ring ───────────────────────────────────────────────────────────────

function ScoreRing({ score, size = 140, colors }: { score: number; size?: number; colors: any }) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(score / 100, 1));
  const strokeDashoffset = circumference * (1 - progress);

  const getScoreColor = () => {
    if (score >= 80) return colors.success;
    if (score >= 60) return colors.primary;
    if (score >= 40) return colors.warning;
    return colors.muted;
  };

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getScoreColor()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text style={{ fontSize: 36, fontWeight: '700', color: colors.foreground }}>{score}</Text>
      <Text style={{ fontSize: 11, color: colors.muted, fontWeight: '500', letterSpacing: 1 }}>SCORE</Text>
    </View>
  );
}

// ─── Metric Card ──────────────────────────────────────────────────────────────

function MetricCard({
  icon,
  label,
  value,
  unit,
  target,
  met,
  colors,
}: {
  icon: string;
  label: string;
  value: number;
  unit: string;
  target: number;
  met: boolean;
  colors: any;
}) {
  const pct = Math.min(value / target, 1);
  return (
    <View style={[metricStyles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <IconSymbol name={icon as any} size={16} color={met ? colors.success : colors.muted} />
          <Text style={{ fontSize: 12, color: colors.muted, fontWeight: '500', letterSpacing: 0.5 }}>
            {label.toUpperCase()}
          </Text>
        </View>
        {met && <IconSymbol name="checkmark.circle.fill" size={16} color={colors.success} />}
      </View>
      <Text style={{ fontSize: 22, fontWeight: '700', color: colors.foreground }}>
        {value.toLocaleString()}{' '}
        <Text style={{ fontSize: 13, fontWeight: '400', color: colors.muted }}>{unit}</Text>
      </Text>
      <View style={{ height: 4, backgroundColor: colors.border, borderRadius: 2, marginTop: 10 }}>
        <View
          style={{
            height: 4,
            borderRadius: 2,
            width: `${pct * 100}%`,
            backgroundColor: met ? colors.success : colors.primary,
          }}
        />
      </View>
      <Text style={{ fontSize: 11, color: colors.muted, marginTop: 4 }}>
        Target: {target.toLocaleString()} {unit}
      </Text>
    </View>
  );
}

const metricStyles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    minWidth: 140,
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function TodayScreen() {
  const colors = useColors();
  const { profile, todayEntry, updateTodayEntry, streakCelebration, setStreakCelebration } = useApp();
  const { data: healthData, loading: healthLoading, fetchTodayData, authorized: healthAuthorized } = useHealthKit();
  const [gratitude, setGratitude] = useState(todayEntry?.gratitude ?? '');
  const [progressNote, setProgressNote] = useState(todayEntry?.progressNote ?? '');
  const [selectedCategory, setSelectedCategory] = useState<ProgressCategory | null>(
    todayEntry?.progressCategory ?? null
  );
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const today = todayString();
  const score = todayEntry?.dailyScore ?? 0;
  const thresholds = profile.thresholds;

  const sleepHours = todayEntry?.sleepHours ?? 0;
  const steps = todayEntry?.steps ?? 0;
  const exerciseMinutes = todayEntry?.exerciseMinutes ?? 0;
  const morningSunlight = todayEntry?.morningSunlight ?? null;

  const sleepMet = sleepHours >= thresholds.sleepHours;
  const stepsMet = steps >= thresholds.steps;
  const exerciseMet = exerciseMinutes >= thresholds.exerciseMinutes;

  const handleSyncHealthKit = async () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await fetchTodayData();
    if (healthData) {
      await updateTodayEntry({
        sleepHours: healthData.sleepHours,
        steps: healthData.steps,
        exerciseMinutes: healthData.exerciseMinutes,
      });
    }
  };

  const handleSunlight = async (val: boolean) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await updateTodayEntry({ morningSunlight: val });
  };

  const handleSaveReflection = async () => {
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSaving(true);
    await updateTodayEntry({
      gratitude,
      progressNote,
      progressCategory: selectedCategory,
    });
    setSaving(false);
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Check for streak milestones
  useEffect(() => {
    if (profile.streak > 0 && (profile.streak === 7 || profile.streak === 30 || profile.streak === 100)) {
      setStreakCelebration({ visible: true, streak: profile.streak });
    }
  }, [profile.streak]);

  const s = styles(colors);

  return (
    <>
      <StreakCelebration
        visible={streakCelebration.visible}
        streak={streakCelebration.streak}
        onClose={() => setStreakCelebration({ visible: false, streak: 0 })}
        colors={colors}
      />
      <ScreenContainer containerClassName="bg-background">
      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>{getGreeting()}{profile.name ? `, ${profile.name}` : ''}</Text>
            <Text style={s.dateText}>{formatDate(today)}</Text>
          </View>
          {profile.streak > 0 && (
            <View style={[s.streakBadge, { backgroundColor: colors.warning + '20' }]}>
              <Text style={{ fontSize: 16 }}>🔥</Text>
              <Text style={[s.streakText, { color: colors.warning }]}>{profile.streak}</Text>
            </View>
          )}
        </View>

        {/* Daily Score Card */}
        <View style={[s.scoreCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={{ alignItems: 'center' }}>
            <ScoreRing score={score} colors={colors} />
            <Text style={[s.scoreLabel, { color: colors.foreground }]}>Daily Thrive Score</Text>
            <Text style={[s.scoreSubtext, { color: colors.muted }]}>
              {score >= 80
                ? 'Excellent day — keep it up.'
                : score >= 60
                ? 'Good progress. A few more actions will boost your score.'
                : score >= 40
                ? 'Getting started. Complete your reflections.'
                : 'Log your metrics to build your score.'}
            </Text>
          </View>
        </View>

        {/* Sync Button */}
        {Platform.OS === 'ios' && (
          <Pressable
            style={({ pressed }) => [
              { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, backgroundColor: colors.primary + '15', marginBottom: 20 },
              pressed && { opacity: 0.7 },
            ]}
            onPress={handleSyncHealthKit}
            disabled={healthLoading}
          >
            <IconSymbol name={healthLoading ? 'hourglass' : 'arrow.clockwise'} size={16} color={colors.primary} />
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary, flex: 1 }}>
              {healthLoading ? 'Syncing...' : 'Sync Apple Health'}
            </Text>
            {healthData && <IconSymbol name="checkmark.circle.fill" size={16} color={colors.success} />}
          </Pressable>
        )}

        {/* Automated Metrics */}
        <Text style={s.sectionTitle}>Activity</Text>
        <View style={s.metricsGrid}>
          <MetricCard
            icon="moon.fill"
            label="Sleep"
            value={sleepHours}
            unit="hrs"
            target={thresholds.sleepHours}
            met={sleepMet}
            colors={colors}
          />
          <MetricCard
            icon="figure.walk"
            label="Steps"
            value={steps}
            unit="steps"
            target={thresholds.steps}
            met={stepsMet}
            colors={colors}
          />
        </View>
        <View style={[s.metricsGrid, { marginTop: 12 }]}>
          <MetricCard
            icon="flame.fill"
            label="Exercise"
            value={exerciseMinutes}
            unit="min"
            target={thresholds.exerciseMinutes}
            met={exerciseMet}
            colors={colors}
          />
          <View style={{ flex: 1 }} />
        </View>

        {/* Morning Sunlight */}
        <Text style={s.sectionTitle}>Morning Sunlight</Text>
        <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
            <IconSymbol name="sun.max.fill" size={20} color={colors.warning} />
            <View style={{ flex: 1 }}>
              <Text style={[s.cardTitle, { color: colors.foreground }]}>
                Did you get outside within 1 hour of waking?
              </Text>
              <Text style={[s.cardSubtext, { color: colors.muted }]}>
                Morning sunlight supports circadian rhythm, sleep quality, and mood.
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable
              style={({ pressed }) => [
                s.toggleBtn,
                {
                  backgroundColor: morningSunlight === true ? colors.success + '20' : colors.border,
                  borderColor: morningSunlight === true ? colors.success : colors.border,
                },
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => handleSunlight(true)}
            >
              <IconSymbol name="checkmark" size={16} color={morningSunlight === true ? colors.success : colors.muted} />
              <Text style={{ fontSize: 15, fontWeight: '600', color: morningSunlight === true ? colors.success : colors.muted }}>
                Yes
              </Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                s.toggleBtn,
                {
                  backgroundColor: morningSunlight === false ? colors.error + '15' : colors.border,
                  borderColor: morningSunlight === false ? colors.error : colors.border,
                },
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => handleSunlight(false)}
            >
              <IconSymbol name="xmark" size={16} color={morningSunlight === false ? colors.error : colors.muted} />
              <Text style={{ fontSize: 15, fontWeight: '600', color: morningSunlight === false ? colors.error : colors.muted }}>
                No
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Evening Reflection */}
        <Text style={s.sectionTitle}>Evening Reflection</Text>

        {/* Gratitude */}
        <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <IconSymbol name="sparkles" size={18} color={colors.primary} />
            <Text style={[s.cardTitle, { color: colors.foreground }]}>What's something good from today?</Text>
          </View>
          <TextInput
            value={gratitude}
            onChangeText={setGratitude}
            placeholder="A small win, a moment, anything..."
            placeholderTextColor={colors.muted}
            multiline
            numberOfLines={3}
            style={[s.textInput, { color: colors.foreground, borderColor: colors.border }]}
            textAlignVertical="top"
          />
        </View>

        {/* Progress */}
        <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <IconSymbol name="chart.line.uptrend.xyaxis" size={18} color={colors.primary} />
            <Text style={[s.cardTitle, { color: colors.foreground }]}>What progress did you make today?</Text>
          </View>
          <TextInput
            value={progressNote}
            onChangeText={setProgressNote}
            placeholder="Any forward movement counts..."
            placeholderTextColor={colors.muted}
            multiline
            numberOfLines={3}
            style={[s.textInput, { color: colors.foreground, borderColor: colors.border }]}
            textAlignVertical="top"
          />
          {/* Category tag */}
          <Pressable
            style={({ pressed }) => [
              s.categoryBtn,
              {
                backgroundColor: selectedCategory ? colors.primary + '15' : colors.background,
                borderColor: selectedCategory ? colors.primary : colors.border,
              },
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => setShowCategoryModal(true)}
          >
            <IconSymbol name="tag.fill" size={14} color={selectedCategory ? colors.primary : colors.muted} />
            <Text style={{ fontSize: 14, color: selectedCategory ? colors.primary : colors.muted, fontWeight: '500' }}>
              {selectedCategory ?? 'Add category'}
            </Text>
            <IconSymbol name="chevron.down" size={14} color={selectedCategory ? colors.primary : colors.muted} />
          </Pressable>
        </View>

        {/* Save Button */}
        <Pressable
          style={({ pressed }) => [
            s.saveBtn,
            { backgroundColor: colors.primary },
            pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
          ]}
          onPress={handleSaveReflection}
          disabled={saving}
        >
          <IconSymbol name="checkmark" size={18} color="#fff" />
          <Text style={s.saveBtnText}>{saving ? 'Saving...' : 'Save Reflection'}</Text>
        </Pressable>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Category Modal */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
          onPress={() => setShowCategoryModal(false)}
        >
          <View style={[s.modalSheet, { backgroundColor: colors.surface }]}>
            <View style={[s.modalHandle, { backgroundColor: colors.border }]} />
            <Text style={[s.modalTitle, { color: colors.foreground }]}>Progress Category</Text>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                style={({ pressed }) => [
                  s.modalItem,
                  { borderBottomColor: colors.border },
                  pressed && { backgroundColor: colors.border },
                ]}
                onPress={() => {
                  if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedCategory(cat === selectedCategory ? null : cat);
                  setShowCategoryModal(false);
                }}
              >
                <Text style={{ fontSize: 16, color: colors.foreground }}>{cat}</Text>
                {selectedCategory === cat && (
                  <IconSymbol name="checkmark" size={18} color={colors.primary} />
                )}
              </Pressable>
            ))}
            <View style={{ height: 24 }} />
          </View>
        </Pressable>
      </Modal>
    </ScreenContainer>
    </>
  );
}

const styles = (colors: any) =>
  StyleSheet.create({
    scrollContent: {
      padding: 20,
      paddingBottom: 40,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    greeting: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.foreground,
    },
    dateText: {
      fontSize: 14,
      color: colors.muted,
      marginTop: 2,
    },
    streakBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 100,
    },
    streakText: {
      fontSize: 15,
      fontWeight: '700',
    },
    scoreCard: {
      borderRadius: 20,
      padding: 28,
      borderWidth: 1,
      marginBottom: 28,
      alignItems: 'center',
    },
    scoreLabel: {
      fontSize: 15,
      fontWeight: '600',
      marginTop: 16,
      letterSpacing: 0.3,
    },
    scoreSubtext: {
      fontSize: 13,
      textAlign: 'center',
      marginTop: 6,
      lineHeight: 20,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.muted,
      letterSpacing: 1,
      marginBottom: 12,
      textTransform: 'uppercase',
    },
    metricsGrid: {
      flexDirection: 'row',
      gap: 12,
    },
    card: {
      borderRadius: 16,
      padding: 18,
      borderWidth: 1,
      marginBottom: 16,
    },
    cardTitle: {
      fontSize: 15,
      fontWeight: '600',
      lineHeight: 22,
      flex: 1,
    },
    cardSubtext: {
      fontSize: 13,
      lineHeight: 20,
      marginTop: 4,
    },
    toggleBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1.5,
    },
    textInput: {
      fontSize: 15,
      lineHeight: 22,
      borderWidth: 1,
      borderRadius: 12,
      padding: 12,
      minHeight: 80,
    },
    categoryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 12,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 100,
      borderWidth: 1,
      alignSelf: 'flex-start',
    },
    saveBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      paddingVertical: 16,
      borderRadius: 16,
      marginTop: 8,
    },
    saveBtnText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    modalSheet: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 20,
      paddingTop: 12,
    },
    modalHandle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      alignSelf: 'center',
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 8,
    },
    modalItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      borderBottomWidth: 0.5,
    },
  });
