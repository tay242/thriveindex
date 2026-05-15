import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useApp } from '@/lib/app-context';
import { DEFAULT_THRESHOLDS } from '@/lib/store';
import { CORE_METRICS_SCIENCE, EXTRA_METRICS_PRESETS } from '@/lib/science';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Milestone definitions ────────────────────────────────────────────────────

const MILESTONES = [
  { id: 'first_day', label: 'First Day', description: 'Logged your first daily entry', icon: 'star.fill', threshold: 1 },
  { id: 'streak_3', label: '3-Day Streak', description: 'Maintained a 3-day streak', icon: 'flame.fill', threshold: 3 },
  { id: 'streak_7', label: 'Week Warrior', description: 'Maintained a 7-day streak', icon: 'trophy.fill', threshold: 7 },
  { id: 'streak_14', label: 'Fortnight Focus', description: '14-day streak achieved', icon: 'trophy.fill', threshold: 14 },
  { id: 'streak_30', label: 'Monthly Master', description: '30-day streak achieved', icon: 'trophy.fill', threshold: 30 },
  { id: 'score_80', label: 'High Performer', description: 'Scored 80+ on a single day', icon: 'bolt.fill', threshold: 80 },
  { id: 'days_7', label: '7 Days Tracked', description: 'Tracked 7 total days', icon: 'calendar', threshold: 7 },
  { id: 'days_30', label: '30 Days Tracked', description: 'Tracked 30 total days', icon: 'calendar', threshold: 30 },
];

// ─── Threshold Stepper ────────────────────────────────────────────────────────

function ThresholdStepper({
  label,
  icon,
  value,
  unit,
  min,
  max,
  step,
  onChange,
  colors,
}: {
  label: string;
  icon: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  colors: any;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: colors.border }}>
      <IconSymbol name={icon as any} size={18} color={colors.primary} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ fontSize: 15, fontWeight: '500', color: colors.foreground }}>{label}</Text>
        <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
          Target: {value} {unit}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Pressable
          style={({ pressed }) => [
            { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
            pressed && { opacity: 0.6 },
          ]}
          onPress={() => {
            if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onChange(Math.max(min, Math.round((value - step) * 10) / 10));
          }}
        >
          <IconSymbol name="minus" size={14} color={colors.foreground} />
        </Pressable>
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.primary, minWidth: 60, textAlign: 'center' }}>
          {value} <Text style={{ fontSize: 12, fontWeight: '400', color: colors.muted }}>{unit}</Text>
        </Text>
        <Pressable
          style={({ pressed }) => [
            { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
            pressed && { opacity: 0.6 },
          ]}
          onPress={() => {
            if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onChange(Math.min(max, Math.round((value + step) * 10) / 10));
          }}
        >
          <IconSymbol name="plus" size={14} color={colors.foreground} />
        </Pressable>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const colors = useColors();
  const router = useRouter();
  const { profile, updateProfile, allDailyEntries } = useApp();
  const [thresholds, setThresholds] = useState(profile.thresholds);
  const [saving, setSaving] = useState(false);

  const totalDays = allDailyEntries.length;
  const bestScore = allDailyEntries.length > 0
    ? Math.max(...allDailyEntries.map((e) => e.dailyScore))
    : 0;

  const unlockedMilestones = MILESTONES.filter((m) => {
    if (m.id === 'first_day') return totalDays >= 1;
    if (m.id.startsWith('streak_')) return profile.longestStreak >= m.threshold;
    if (m.id === 'score_80') return bestScore >= 80;
    if (m.id.startsWith('days_')) return totalDays >= m.threshold;
    return false;
  });

  const handleSaveThresholds = async () => {
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSaving(true);
    await updateProfile({ thresholds });
    setSaving(false);
  };

  const handleReset = () => {
    Alert.alert(
      'Reset App Data',
      'This will clear all your tracking data and return to onboarding. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
            {
              text: 'Reset',
              style: 'destructive',
              onPress: async () => {
                await AsyncStorage.clear();
                // Force reload
                if (Platform.OS === 'web') {
                  (window as any).location.reload();
                }
              },
            },
      ]
    );
  };

  const s = styles(colors);

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.header}>
          <View style={[s.avatar, { backgroundColor: colors.primary + '20' }]}>
            <Text style={{ fontSize: 28, fontWeight: '700', color: colors.primary }}>
              {profile.name ? profile.name[0].toUpperCase() : 'T'}
            </Text>
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={s.name}>{profile.name || 'ThriveIndex User'}</Text>
            <Text style={s.joined}>Member since {profile.joinedDate}</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={s.statsRow}>
          <View style={[s.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={{ fontSize: 28, fontWeight: '700', color: colors.warning }}>🔥</Text>
            <Text style={[s.statValue, { color: colors.foreground }]}>{profile.streak}</Text>
            <Text style={[s.statLabel, { color: colors.muted }]}>Current Streak</Text>
          </View>
          <View style={[s.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={{ fontSize: 28, fontWeight: '700', color: colors.primary }}>📅</Text>
            <Text style={[s.statValue, { color: colors.foreground }]}>{totalDays}</Text>
            <Text style={[s.statLabel, { color: colors.muted }]}>Days Tracked</Text>
          </View>
          <View style={[s.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={{ fontSize: 28, fontWeight: '700', color: colors.success }}>⭐</Text>
            <Text style={[s.statValue, { color: colors.foreground }]}>{profile.longestStreak}</Text>
            <Text style={[s.statLabel, { color: colors.muted }]}>Best Streak</Text>
          </View>
        </View>

        {/* Milestones */}
        <Text style={s.sectionTitle}>Milestones</Text>
        <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {MILESTONES.map((m, i) => {
            const unlocked = unlockedMilestones.some((u) => u.id === m.id);
            return (
              <View
                key={m.id}
                style={[
                  s.milestoneRow,
                  i < MILESTONES.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: colors.border },
                  !unlocked && { opacity: 0.4 },
                ]}
              >
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: unlocked ? colors.primary + '20' : colors.border, alignItems: 'center', justifyContent: 'center' }}>
                  <IconSymbol name={m.icon as any} size={18} color={unlocked ? colors.primary : colors.muted} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>{m.label}</Text>
                  <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>{m.description}</Text>
                </View>
                {unlocked && <IconSymbol name="checkmark.circle.fill" size={20} color={colors.success} />}
              </View>
            );
          })}
        </View>

        {/* The Science & Extra Metrics Cards */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
          <Pressable
            style={({ pressed }) => [
              { flex: 1, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: 12 },
              pressed && { opacity: 0.7 },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <IconSymbol name="book.fill" size={20} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.foreground }}>The Science</Text>
                <Text style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>Research</Text>
              </View>
            </View>
          </Pressable>

          <View
            style={{
              flex: 1,
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 12,
              padding: 12,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <IconSymbol name="plus.circle.fill" size={20} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.foreground }}>Extra Metrics</Text>
                <Text style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>{profile.enabledExtraMetrics.length} enabled</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Extra Metrics Toggle Section */}
        <Text style={s.sectionTitle}>Your Extra Metrics</Text>
        <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border, padding: 0 }]}>
          {EXTRA_METRICS_PRESETS.map((preset, index) => {
            const isEnabled = profile.enabledExtraMetrics.includes(preset.id);
            return (
              <View key={preset.id}>
                <Pressable
                  style={({ pressed }) => [
                    { paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => {
                    const updated = isEnabled
                      ? profile.enabledExtraMetrics.filter(id => id !== preset.id)
                      : [...profile.enabledExtraMetrics, preset.id];
                    updateProfile({ enabledExtraMetrics: updated });
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                    <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: isEnabled ? colors.primary + '20' : colors.border, alignItems: 'center', justifyContent: 'center' }}>
                      <IconSymbol name={preset.icon as any} size={18} color={isEnabled ? colors.primary : colors.muted} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>{preset.name}</Text>
                      <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>{preset.description}</Text>
                    </View>
                  </View>
                  <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: isEnabled ? colors.primary : colors.border, alignItems: 'center', justifyContent: 'center' }}>
                    {isEnabled && <IconSymbol name="checkmark" size={14} color={colors.background} />}
                  </View>
                </Pressable>
                {index < EXTRA_METRICS_PRESETS.length - 1 && (
                  <View style={{ height: 0.5, backgroundColor: colors.border, marginHorizontal: 16 }} />
                )}
              </View>
            );
          })}
        </View>

        {/* Notification Settings */}
        <Text style={s.sectionTitle}>Notification Settings</Text>
        <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <NotificationTimePicker
            label="Daily Reminder"
            icon="bell.fill"
            time={profile.dailyNotificationTime}
            onTimeChange={(time) => updateProfile({ dailyNotificationTime: time })}
            colors={colors}
            description="Evening reflection prompt"
          />
          <View style={{ height: 0.5, backgroundColor: colors.border, marginHorizontal: 16 }} />
          <NotificationDayTimePicker
            label="Weekly Reminder"
            icon="calendar.badge.fill"
            day={profile.weeklyNotificationDay}
            time={profile.weeklyNotificationTime}
            onDayChange={(day) => updateProfile({ weeklyNotificationDay: day })}
            onTimeChange={(time) => updateProfile({ weeklyNotificationTime: time })}
            colors={colors}
            description="Weekly check-in prompt"
          />
        </View>

        {/* Weekly Email Digest */}
        <Text style={s.sectionTitle}>Weekly Digest</Text>
        <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: colors.foreground, marginBottom: 4 }}>
                Weekly Summary Email
              </Text>
              <Text style={{ fontSize: 13, color: colors.muted }}>
                Get personalized insights every Sunday
              </Text>
            </View>
            <Pressable
              style={({ pressed }) => [{
                width: 50,
                height: 28,
                borderRadius: 14,
                backgroundColor: profile.weeklyEmailEnabled ? colors.primary : colors.border,
                alignItems: 'center',
                justifyContent: 'center',
              }, pressed && { opacity: 0.8 }]}
              onPress={() => {
                if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                updateProfile({ weeklyEmailEnabled: !profile.weeklyEmailEnabled });
              }}
            >
              <View style={[{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: colors.background,
              }, profile.weeklyEmailEnabled ? { marginLeft: 2 } : { marginRight: 2 }]} />
            </Pressable>
          </View>
          {profile.weeklyEmailEnabled && (
            <>
              <View style={{ height: 0.5, backgroundColor: colors.border, marginHorizontal: 16 }} />
              <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
                <Text style={{ fontSize: 13, color: colors.muted, lineHeight: 20 }}>
                  📧 Receive a personalized summary every Sunday at 9 AM with your weekly performance, top habits, and behavioral insights.
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Thresholds */}
        <Text style={s.sectionTitle}>Targets & Thresholds</Text>
        <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ThresholdStepper
            label="Sleep Target"
            icon="moon.fill"
            value={thresholds.sleepHours}
            unit="hrs"
            min={5}
            max={10}
            step={0.5}
            onChange={(v) => setThresholds({ ...thresholds, sleepHours: v })}
            colors={colors}
          />
          <ThresholdStepper
            label="Daily Steps"
            icon="figure.walk"
            value={thresholds.steps}
            unit="steps"
            min={2000}
            max={15000}
            step={500}
            onChange={(v) => setThresholds({ ...thresholds, steps: v })}
            colors={colors}
          />
          <ThresholdStepper
            label="Exercise"
            icon="flame.fill"
            value={thresholds.exerciseMinutes}
            unit="min"
            min={10}
            max={90}
            step={5}
            onChange={(v) => setThresholds({ ...thresholds, exerciseMinutes: v })}
            colors={colors}
          />
          <Pressable
            style={({ pressed }) => [
              s.saveBtn,
              { backgroundColor: colors.primary, marginTop: 16 },
              pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
            ]}
            onPress={handleSaveThresholds}
            disabled={saving}
          >
            <Text style={s.saveBtnText}>{saving ? 'Saving...' : 'Save Targets'}</Text>
          </Pressable>
        </View>

        {/* Subscription */}
        <Text style={s.sectionTitle}>ThriveIndex Pro</Text>
        <View style={[s.card, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <IconSymbol name="sparkles" size={22} color={colors.primary} />
            <Text style={{ fontSize: 17, fontWeight: '700', color: colors.foreground }}>
              Support Our Mission
            </Text>
          </View>
          <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 22, marginBottom: 16 }}>
            You're doing us a favor by upgrading. Your support funds a small team dedicated to building tools that make the world a better, happier place. Plus, unlock advanced insights, AI reflection summaries, personalized recommendations, and habit correlation analysis.
          </Text>
          <View style={{ gap: 8, marginBottom: 16 }}>
            {[
              'AI-powered reflection summaries',
              'Habit correlation engine',
              'Personalized recommendations',
              'Advanced trend analysis',
            ].map((f) => (
              <View key={f} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <IconSymbol name="checkmark.circle.fill" size={16} color={colors.primary} />
                <Text style={{ fontSize: 14, color: colors.foreground }}>{f}</Text>
              </View>
            ))}
          </View>
          <View style={[s.priceRow, { borderColor: colors.primary + '30' }]}>
            <Text style={{ fontSize: 24, fontWeight: '700', color: colors.primary }}>$0.99</Text>
            <Text style={{ fontSize: 14, color: colors.muted }}> / month</Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              s.saveBtn,
              { backgroundColor: colors.primary },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={s.saveBtnText}>Start Free Trial</Text>
          </Pressable>
        </View>

        {/* Share ThriveIndex */}
        <Text style={s.sectionTitle}>Share & Earn</Text>
        <View style={[s.card, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <IconSymbol name="square.and.arrow.up" size={22} color={colors.primary} />
            <Text style={{ fontSize: 17, fontWeight: '700', color: colors.foreground }}>
              Share ThriveIndex
            </Text>
          </View>
          <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 22, marginBottom: 16 }}>
            Invite friends and earn rewards. For each friend who signs up with your code, you both get 7 bonus trial days.
          </Text>
          <View style={{ backgroundColor: colors.background, borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 6, fontWeight: '600' }}>Your Referral Code</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.primary, flex: 1 }}>
                {profile.referralCode || 'Loading...'}
              </Text>
              <Pressable
                style={({ pressed }) => [{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 8,
                  backgroundColor: colors.primary,
                }, pressed && { opacity: 0.8 }]}
                onPress={async () => {
                  if (profile.referralCode) {
                    await Clipboard.setStringAsync(profile.referralCode);
                    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    Alert.alert('Copied!', 'Referral code copied to clipboard');
                  }
                }}
              >
                <IconSymbol name="doc.on.doc" size={16} color="#fff" />
              </Pressable>
            </View>
          </View>
          <View style={{ gap: 8, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <IconSymbol name="person.2.fill" size={16} color={colors.primary} />
              <Text style={{ fontSize: 14, color: colors.foreground }}>Referrals: {profile.referralsCount}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <IconSymbol name="calendar" size={16} color={colors.primary} />
              <Text style={{ fontSize: 14, color: colors.foreground }}>Bonus Days: {profile.referralRewardDays}</Text>
            </View>
          </View>
          <Pressable
            style={({ pressed }) => [{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 14,
              borderRadius: 12,
              backgroundColor: colors.primary,
            }, pressed && { opacity: 0.85 }]}
            onPress={async () => {
              const message = `Join me on ThriveIndex! Use code ${profile.referralCode} to get 7 bonus trial days. Let's build better wellbeing habits together. 🌱`;
              if (Platform.OS !== 'web' && await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(message);
              } else {
                await Clipboard.setStringAsync(message);
                Alert.alert('Message copied', 'Share this with your friends');
              }
            }}
          >
            <Text style={s.saveBtnText}>Share with Friends</Text>
          </Pressable>
        </View>

        {/* App Info */}
        <Text style={s.sectionTitle}>About</Text>
        <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={s.infoRow}>
            <Text style={{ fontSize: 15, color: colors.foreground }}>Version</Text>
            <Text style={{ fontSize: 15, color: colors.muted }}>1.0.0</Text>
          </View>
          <View style={[s.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={{ fontSize: 15, color: colors.foreground }}>Philosophy</Text>
            <Text style={{ fontSize: 13, color: colors.muted, flex: 1, textAlign: 'right' }}>Consistency over perfection</Text>
          </View>
        </View>

        {/* Reset */}
        <Pressable
          style={({ pressed }) => [
            s.resetBtn,
            { borderColor: colors.error + '40' },
            pressed && { opacity: 0.7 },
          ]}
          onPress={handleReset}
        >
          <Text style={{ fontSize: 14, color: colors.error, fontWeight: '500' }}>Reset App Data</Text>
        </Pressable>

        <View style={{ height: 32 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

// ─── Notification Time Picker ────────────────────────────────────────────────

function NotificationTimePicker({
  label,
  icon,
  time,
  onTimeChange,
  colors,
  description,
}: {
  label: string;
  icon: string;
  time: string;
  onTimeChange: (time: string) => void;
  colors: any;
  description: string;
}) {
  const [hour, minute] = time.split(':').map(Number);
  const [showPicker, setShowPicker] = useState(false);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 15, 30, 45];

  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 14 }}>
      <Pressable
        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
        onPress={() => setShowPicker(!showPicker)}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
            <IconSymbol name={icon as any} size={18} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '500', color: colors.foreground }}>{label}</Text>
              <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>{description}</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.primary }}>
              {String(hour).padStart(2, '0')}:{String(minute).padStart(2, '0')}
            </Text>
            <IconSymbol name={showPicker ? 'chevron.up' : 'chevron.down'} size={14} color={colors.muted} />
          </View>
        </View>
      </Pressable>

      {showPicker && (
        <View style={{ marginTop: 12, gap: 12 }}>
          <View>
            <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 8, fontWeight: '600' }}>Hour</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {hours.map((h) => (
                <Pressable
                  key={h}
                  style={({ pressed }) => [{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 8,
                    backgroundColor: h === hour ? colors.primary : colors.border,
                    minWidth: 50,
                    alignItems: 'center',
                  }, pressed && { opacity: 0.8 }]}
                  onPress={() => {
                    onTimeChange(`${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
                    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '600', color: h === hour ? '#fff' : colors.foreground }}>
                    {String(h).padStart(2, '0')}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
          <View>
            <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 8, fontWeight: '600' }}>Minute</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {minutes.map((m) => (
                <Pressable
                  key={m}
                  style={({ pressed }) => [{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 8,
                    backgroundColor: m === minute ? colors.primary : colors.border,
                    minWidth: 50,
                    alignItems: 'center',
                  }, pressed && { opacity: 0.8 }]}
                  onPress={() => {
                    onTimeChange(`${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
                    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '600', color: m === minute ? '#fff' : colors.foreground }}>
                    {String(m).padStart(2, '0')}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}

// ─── Notification Day/Time Picker ─────────────────────────────────────────────

function NotificationDayTimePicker({
  label,
  icon,
  day,
  time,
  onDayChange,
  onTimeChange,
  colors,
  description,
}: {
  label: string;
  icon: string;
  day: number;
  time: string;
  onDayChange: (day: number) => void;
  onTimeChange: (time: string) => void;
  colors: any;
  description: string;
}) {
  const [hour, minute] = time.split(':').map(Number);
  const [showPicker, setShowPicker] = useState(false);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 15, 30, 45];

  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 14 }}>
      <Pressable
        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
        onPress={() => setShowPicker(!showPicker)}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
            <IconSymbol name={icon as any} size={18} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '500', color: colors.foreground }}>{label}</Text>
              <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>{description}</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary }}>
              {days[day]} {String(hour).padStart(2, '0')}:{String(minute).padStart(2, '0')}
            </Text>
            <IconSymbol name={showPicker ? 'chevron.up' : 'chevron.down'} size={14} color={colors.muted} />
          </View>
        </View>
      </Pressable>

      {showPicker && (
        <View style={{ marginTop: 12, gap: 12 }}>
          <View>
            <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 8, fontWeight: '600' }}>Day</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {days.map((d, i) => (
                <Pressable
                  key={i}
                  style={({ pressed }) => [{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 8,
                    backgroundColor: i === day ? colors.primary : colors.border,
                  }, pressed && { opacity: 0.8 }]}
                  onPress={() => {
                    onDayChange(i);
                    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '600', color: i === day ? '#fff' : colors.foreground }}>
                    {d.slice(0, 3)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View>
            <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 8, fontWeight: '600' }}>Hour</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {hours.map((h) => (
                <Pressable
                  key={h}
                  style={({ pressed }) => [{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 8,
                    backgroundColor: h === hour ? colors.primary : colors.border,
                    minWidth: 50,
                    alignItems: 'center',
                  }, pressed && { opacity: 0.8 }]}
                  onPress={() => {
                    onTimeChange(`${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
                    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '600', color: h === hour ? '#fff' : colors.foreground }}>
                    {String(h).padStart(2, '0')}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
          <View>
            <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 8, fontWeight: '600' }}>Minute</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {minutes.map((m) => (
                <Pressable
                  key={m}
                  style={({ pressed }) => [{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 8,
                    backgroundColor: m === minute ? colors.primary : colors.border,
                    minWidth: 50,
                    alignItems: 'center',
                  }, pressed && { opacity: 0.8 }]}
                  onPress={() => {
                    onTimeChange(`${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
                    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '600', color: m === minute ? '#fff' : colors.foreground }}>
                    {String(m).padStart(2, '0')}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = (colors: any) =>
  StyleSheet.create({
    scrollContent: { padding: 20, paddingBottom: 40 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
    },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
    },
    name: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.foreground,
    },
    joined: {
      fontSize: 13,
      color: colors.muted,
      marginTop: 2,
    },
    statsRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 28,
    },
    statBox: {
      flex: 1,
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      alignItems: 'center',
      gap: 4,
    },
    statValue: {
      fontSize: 22,
      fontWeight: '700',
    },
    statLabel: {
      fontSize: 11,
      textAlign: 'center',
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
      marginBottom: 24,
    },
    milestoneRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
    },
    saveBtn: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      borderRadius: 12,
    },
    saveBtnText: {
      color: '#fff',
      fontSize: 15,
      fontWeight: '600',
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      borderTopWidth: 1,
      borderBottomWidth: 1,
      paddingVertical: 12,
      marginBottom: 16,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.border,
    },
    resetBtn: {
      alignItems: 'center',
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 1,
      marginBottom: 8,
    },
  });
