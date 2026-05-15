import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useApp } from '@/lib/app-context';
import { getWeekKey, formatDate } from '@/lib/store';
import * as Haptics from 'expo-haptics';
import Svg, { Circle } from 'react-native-svg';

// ─── Mini Score Ring ──────────────────────────────────────────────────────────

function MiniScoreRing({ score, size = 100, colors }: { score: number; size?: number; colors: any }) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(score / 100, 1));
  const strokeDashoffset = circumference * (1 - progress);

  const getColor = () => {
    if (score >= 80) return colors.success;
    if (score >= 60) return colors.primary;
    if (score >= 40) return colors.warning;
    return colors.muted;
  };

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={colors.border} strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={getColor()} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          strokeLinecap="round" rotation="-90" origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text style={{ fontSize: 26, fontWeight: '700', color: colors.foreground }}>{score}</Text>
      <Text style={{ fontSize: 10, color: colors.muted, fontWeight: '500', letterSpacing: 0.5 }}>WEEK</Text>
    </View>
  );
}

// ─── Habit Toggle Card ────────────────────────────────────────────────────────

function HabitCard({
  icon,
  title,
  prompt,
  basis,
  value,
  onToggle,
  colors,
}: {
  icon: string;
  title: string;
  prompt: string;
  basis: string;
  value: boolean | null;
  onToggle: (v: boolean) => void;
  colors: any;
}) {
  return (
    <View style={[habitStyles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
        <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primary + '15', alignItems: 'center', justifyContent: 'center' }}>
          <IconSymbol name={icon as any} size={18} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.foreground, marginBottom: 4 }}>{title}</Text>
          <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 20 }}>{prompt}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
        <Pressable
          style={({ pressed }) => [
            habitStyles.toggleBtn,
            {
              backgroundColor: value === true ? colors.success + '20' : colors.background,
              borderColor: value === true ? colors.success : colors.border,
            },
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => onToggle(true)}
        >
          <IconSymbol name="checkmark" size={15} color={value === true ? colors.success : colors.muted} />
          <Text style={{ fontSize: 14, fontWeight: '600', color: value === true ? colors.success : colors.muted }}>Yes</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            habitStyles.toggleBtn,
            {
              backgroundColor: value === false ? colors.error + '15' : colors.background,
              borderColor: value === false ? colors.error : colors.border,
            },
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => onToggle(false)}
        >
          <IconSymbol name="xmark" size={15} color={value === false ? colors.error : colors.muted} />
          <Text style={{ fontSize: 14, fontWeight: '600', color: value === false ? colors.error : colors.muted }}>No</Text>
        </Pressable>
      </View>
      <View style={{ backgroundColor: colors.primary + '10', borderRadius: 8, padding: 10 }}>
        <Text style={{ fontSize: 12, color: colors.primary, lineHeight: 18 }}>
          <Text style={{ fontWeight: '600' }}>Why it matters: </Text>{basis}
        </Text>
      </View>
    </View>
  );
}

const habitStyles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    marginBottom: 16,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
});

// ─── Past Reflection Card ─────────────────────────────────────────────────────

function PastReflectionCard({ entry, colors }: { entry: any; colors: any }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Pressable
      style={({ pressed }) => [
        { backgroundColor: colors.surface, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 10 },
        pressed && { opacity: 0.8 },
      ]}
      onPress={() => setExpanded(!expanded)}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>{entry.weekKey}</Text>
          <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>Score: {entry.weeklyScore}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ flexDirection: 'row', gap: 4 }}>
            {[entry.meaningfulConnection, entry.contribution, entry.novelty].map((v, i) => (
              <View
                key={i}
                style={{
                  width: 8, height: 8, borderRadius: 4,
                  backgroundColor: v === true ? colors.success : v === false ? colors.error : colors.border,
                }}
              />
            ))}
          </View>
          <IconSymbol name={expanded ? 'chevron.up' : 'chevron.down'} size={16} color={colors.muted} />
        </View>
      </View>
      {expanded && entry.weeklyJournal ? (
        <Text style={{ fontSize: 14, color: colors.muted, marginTop: 12, lineHeight: 22 }}>
          {entry.weeklyJournal}
        </Text>
      ) : null}
    </Pressable>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function WeekScreen() {
  const colors = useColors();
  const { currentWeekEntry, allWeeklyEntries, updateWeekEntry } = useApp();
  const [journal, setJournal] = useState(currentWeekEntry?.weeklyJournal ?? '');
  const [saving, setSaving] = useState(false);
  const [showPast, setShowPast] = useState(false);

  const weekKey = getWeekKey();
  const weekScore = currentWeekEntry?.weeklyScore ?? 0;

  const handleHabit = async (key: 'meaningfulConnection' | 'contribution' | 'novelty', val: boolean) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await updateWeekEntry({ [key]: val });
  };

  const handleSaveJournal = async () => {
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSaving(true);
    await updateWeekEntry({ weeklyJournal: journal });
    setSaving(false);
  };

  const pastEntries = allWeeklyEntries.filter((e) => e.weekKey !== weekKey).reverse();

  const s = styles(colors);

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>This Week</Text>
          <Text style={s.subtitle}>{weekKey}</Text>
        </View>

        {/* Weekly Score Card */}
        <View style={[s.scoreCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <MiniScoreRing score={weekScore} colors={colors} />
          <View style={{ flex: 1, marginLeft: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.foreground, marginBottom: 4 }}>
              Weekly Thrive Score
            </Text>
            <Text style={{ fontSize: 13, color: colors.muted, lineHeight: 20 }}>
              {weekScore >= 80
                ? 'Outstanding week. You showed up consistently.'
                : weekScore >= 60
                ? 'Solid week. Complete your habits to push higher.'
                : 'Keep going — every action builds your score.'}
            </Text>
            {/* Habit dots */}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              {[
                { key: 'meaningfulConnection', label: 'Connection', val: currentWeekEntry?.meaningfulConnection },
                { key: 'contribution', label: 'Contribution', val: currentWeekEntry?.contribution },
                { key: 'novelty', label: 'Novelty', val: currentWeekEntry?.novelty },
              ].map((h) => (
                <View key={h.key} style={{ alignItems: 'center', gap: 4 }}>
                  <View
                    style={{
                      width: 10, height: 10, borderRadius: 5,
                      backgroundColor: h.val === true ? colors.success : h.val === false ? colors.error : colors.border,
                    }}
                  />
                  <Text style={{ fontSize: 10, color: colors.muted }}>{h.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Weekly Habits */}
        <Text style={s.sectionTitle}>Weekly Habits</Text>

        <HabitCard
          icon="person.2.fill"
          title="Meaningful Connection"
          prompt="Did you intentionally connect with someone this week?"
          basis="Strong social relationships are one of the strongest predictors of long-term wellbeing."
          value={currentWeekEntry?.meaningfulConnection ?? null}
          onToggle={(v) => handleHabit('meaningfulConnection', v)}
          colors={colors}
        />

        <HabitCard
          icon="hand.raised.fill"
          title="Contribution"
          prompt="Did you help someone this week?"
          basis="Contribution, usefulness, and service are associated with higher meaning and life satisfaction."
          value={currentWeekEntry?.contribution ?? null}
          onToggle={(v) => handleHabit('contribution', v)}
          colors={colors}
        />

        <HabitCard
          icon="globe"
          title="Novelty"
          prompt="Did you do something different this week?"
          basis="Novelty and variety improve engagement, memory formation, and perceived life satisfaction."
          value={currentWeekEntry?.novelty ?? null}
          onToggle={(v) => handleHabit('novelty', v)}
          colors={colors}
        />

        {/* Weekly Journal */}
        <Text style={s.sectionTitle}>Weekly Reflection</Text>
        <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <IconSymbol name="pencil" size={18} color={colors.primary} />
            <Text style={{ fontSize: 15, fontWeight: '600', color: colors.foreground }}>
              What stood out about this week?
            </Text>
          </View>
          <TextInput
            value={journal}
            onChangeText={setJournal}
            placeholder="Reflect on wins, challenges, patterns..."
            placeholderTextColor={colors.muted}
            multiline
            numberOfLines={5}
            style={[s.textInput, { color: colors.foreground, borderColor: colors.border }]}
            textAlignVertical="top"
          />
          <Pressable
            style={({ pressed }) => [
              s.saveBtn,
              { backgroundColor: colors.primary },
              pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
            ]}
            onPress={handleSaveJournal}
            disabled={saving}
          >
            <Text style={s.saveBtnText}>{saving ? 'Saving...' : 'Save Reflection'}</Text>
          </Pressable>
        </View>

        {/* Past Reflections */}
        {pastEntries.length > 0 && (
          <>
            <Pressable
              style={({ pressed }) => [
                { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => setShowPast(!showPast)}
            >
              <Text style={s.sectionTitle}>Past Reflections</Text>
              <IconSymbol name={showPast ? 'chevron.up' : 'chevron.down'} size={16} color={colors.muted} />
            </Pressable>
            {showPast &&
              pastEntries.map((entry) => (
                <PastReflectionCard key={entry.weekKey} entry={entry} colors={colors} />
              ))}
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = (colors: any) =>
  StyleSheet.create({
    scrollContent: { padding: 20, paddingBottom: 40 },
    header: { marginBottom: 24 },
    title: { fontSize: 28, fontWeight: '700', color: colors.foreground },
    subtitle: { fontSize: 14, color: colors.muted, marginTop: 4 },
    scoreCard: {
      borderRadius: 20,
      padding: 20,
      borderWidth: 1,
      marginBottom: 28,
      flexDirection: 'row',
      alignItems: 'center',
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.muted,
      letterSpacing: 1,
      marginBottom: 12,
      textTransform: 'uppercase',
    },
    card: {
      borderRadius: 16,
      padding: 18,
      borderWidth: 1,
      marginBottom: 16,
    },
    textInput: {
      fontSize: 15,
      lineHeight: 22,
      borderWidth: 1,
      borderRadius: 12,
      padding: 12,
      minHeight: 100,
    },
    saveBtn: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      borderRadius: 12,
      marginTop: 12,
    },
    saveBtnText: {
      color: '#fff',
      fontSize: 15,
      fontWeight: '600',
    },
  });
