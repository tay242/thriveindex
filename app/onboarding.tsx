import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Animated,
  Dimensions,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useApp } from '@/lib/app-context';
import { DEFAULT_THRESHOLDS, ProgressCategory } from '@/lib/store';
import { EVIDENCE } from '@/lib/evidence';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const STEPS = ['welcome', 'why', 'sampleDay', 'philosophy', 'name', 'health', 'thresholds', 'priorities', 'dailyNotification', 'weeklyNotification'] as const;
type Step = (typeof STEPS)[number];

const ALL_PRIORITIES: ProgressCategory[] = [
  'Health',
  'Career',
  'Family',
  'Financial',
  'Personal Growth',
  'Relationships',
];

export default function OnboardingScreen() {
  const colors = useColors();
  const { completeOnboarding, updateProfile } = useApp();
  const [step, setStep] = useState<Step>('welcome');
  const [name, setName] = useState('');
  const [thresholds, setThresholds] = useState(DEFAULT_THRESHOLDS);
  const [priorities, setPriorities] = useState<ProgressCategory[]>(['Health', 'Personal Growth']);
  const [dailyNotificationTime, setDailyNotificationTime] = useState('21:00');
  const [weeklyNotificationDay, setWeeklyNotificationDay] = useState(0);
  const [weeklyNotificationTime, setWeeklyNotificationTime] = useState('09:00');
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const stepIndex = STEPS.indexOf(step);
  const progress = (stepIndex + 1) / STEPS.length;

  const animateTransition = (nextStep: Step) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setStep(nextStep);
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    });
  };

  const goNext = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = STEPS[stepIndex + 1];
    if (next) animateTransition(next);
  };

  const goBack = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const prev = STEPS[stepIndex - 1];
    if (prev) animateTransition(prev);
  };

  const handleFinish = async () => {
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await updateProfile({ thresholds, priorities, dailyNotificationTime, weeklyNotificationDay, weeklyNotificationTime });
    await completeOnboarding(name || 'Friend');
  };

  const togglePriority = (p: ProgressCategory) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPriorities((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const s = styles(colors);

  return (
    <ScreenContainer containerClassName="bg-background" edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Progress bar */}
        <View style={s.progressContainer}>
          <View style={[s.progressBar, { width: `${progress * 100}%` as any }]} />
        </View>

        <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
          <ScrollView
            contentContainerStyle={s.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {step === 'welcome' && <WelcomeStep colors={colors} />}
            {step === 'why' && <WhyStep colors={colors} />}
            {step === 'sampleDay' && <SampleDayStep colors={colors} />}
            {step === 'philosophy' && <PhilosophyStep colors={colors} />}
            {step === 'name' && (
              <NameStep colors={colors} name={name} setName={setName} />
            )}
            {step === 'health' && <HealthStep colors={colors} />}
            {step === 'thresholds' && (
              <ThresholdsStep
                colors={colors}
                thresholds={thresholds}
                setThresholds={setThresholds}
              />
            )}
            {step === 'priorities' && (
              <PrioritiesStep
                colors={colors}
                priorities={priorities}
                togglePriority={togglePriority}
                allPriorities={ALL_PRIORITIES}
              />
            )}
            {step === 'dailyNotification' && (
              <DailyNotificationStep
                colors={colors}
                time={dailyNotificationTime}
                setTime={setDailyNotificationTime}
              />
            )}
            {step === 'weeklyNotification' && (
              <WeeklyNotificationStep
                colors={colors}
                day={weeklyNotificationDay}
                setDay={setWeeklyNotificationDay}
                time={weeklyNotificationTime}
                setTime={setWeeklyNotificationTime}
              />
            )}
          </ScrollView>
        </Animated.View>

        {/* Navigation buttons */}
        <View style={s.navRow}>
          {stepIndex > 0 ? (
            <Pressable style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.6 }]} onPress={goBack}>
              <IconSymbol name="chevron.left" size={20} color={colors.primary} />
              <Text style={[s.backText, { color: colors.primary, fontWeight: '600' }]}>Back</Text>
            </Pressable>
          ) : (
            <View style={{ flex: 1 }} />
          )}

          {step !== 'weeklyNotification' ? (
            <Pressable
              style={({ pressed }) => [s.nextBtn, { backgroundColor: colors.primary }, pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] }]}
              onPress={goNext}
              disabled={step === 'name' && name.trim().length === 0}
            >
              <Text style={s.nextText}>Continue</Text>
              <IconSymbol name="arrow.right" size={18} color="#fff" />
            </Pressable>
          ) : (
            <Pressable
              style={({ pressed }) => [s.nextBtn, { backgroundColor: colors.primary }, pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] }]}
              onPress={handleFinish}
            >
              <Text style={s.nextText}>Get Started</Text>
              <IconSymbol name="sparkles" size={18} color="#fff" />
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

// ─── Step Components ──────────────────────────────────────────────────────────

function WelcomeStep({ colors }: { colors: any }) {
  return (
    <View style={{ alignItems: 'center', paddingTop: 60 }}>
      {/* App Logo */}
      <Image
        source={require('@/assets/images/icon.png')}
        style={{ width: 100, height: 100, borderRadius: 28, marginBottom: 40 }}
      />
      <Text style={{ fontSize: 36, fontWeight: '800', color: colors.foreground, textAlign: 'center', marginBottom: 12, letterSpacing: -0.5 }}>
        ThriveIndex
      </Text>
      <Text style={{ fontSize: 17, color: colors.foreground, textAlign: 'center', lineHeight: 26, paddingHorizontal: 12, fontWeight: '500', opacity: 0.85 }}>
        A scientifically grounded operating system for a better life.
      </Text>
      <View style={{ marginTop: 56, gap: 18, width: '100%', paddingHorizontal: 8 }}>
        {[
          { icon: 'bolt.fill', text: 'Evidence-based behaviors' },
          { icon: 'chart.bar.fill', text: 'Measurable daily progress' },
          { icon: 'sparkles', text: 'Less than 2 minutes per day' },
        ].map((item) => (
          <View key={item.text} style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.primary + '20', alignItems: 'center', justifyContent: 'center' }}>
              <IconSymbol name={item.icon as any} size={22} color={colors.primary} />
            </View>
            <Text style={{ fontSize: 16, color: colors.foreground, fontWeight: '500', lineHeight: 22 }}>{item.text}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function PhilosophyStep({ colors }: { colors: any }) {
  return (
    <View style={{ paddingTop: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: '700', color: colors.foreground, marginBottom: 8 }}>
        The Science
      </Text>
      <Text style={{ fontSize: 16, color: colors.muted, marginBottom: 32, lineHeight: 24 }}>
        Why consistency beats intensity.
      </Text>
      {[
        {
          title: 'Behaviors predict wellbeing',
          body: 'Research consistently shows that certain daily behaviors — sleep, movement, social connection, and reflection — are strongly associated with improved mood, resilience, and life satisfaction.',
        },
        {
          title: 'Consistency is the variable',
          body: 'The difference between people who thrive and those who struggle is rarely talent or circumstance. It is consistent execution of evidence-based habits.',
        },
        {
          title: 'What gets measured, gets done',
          body: 'ThriveIndex gives you a clear, daily signal: are you doing the behaviors associated with a better life? No guesswork. No fluff.',
        },
      ].map((card) => (
        <View
          key={card.title}
          style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}
        >
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground, marginBottom: 8 }}>{card.title}</Text>
          <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 22 }}>{card.body}</Text>
        </View>
      ))}
    </View>
  );
}

function NameStep({ colors, name, setName }: { colors: any; name: string; setName: (v: string) => void }) {
  return (
    <View style={{ paddingTop: 40 }}>
      <Text style={{ fontSize: 28, fontWeight: '700', color: colors.foreground, marginBottom: 8 }}>
        What should we call you?
      </Text>
      <Text style={{ fontSize: 16, color: colors.muted, marginBottom: 40, lineHeight: 24 }}>
        This is just for personalization. No account required.
      </Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Your first name"
        placeholderTextColor={colors.muted}
        style={{
          fontSize: 20,
          fontWeight: '500',
          color: colors.foreground,
          borderBottomWidth: 2,
          borderBottomColor: name.length > 0 ? colors.primary : colors.border,
          paddingVertical: 12,
          paddingHorizontal: 4,
        }}
        autoFocus
        returnKeyType="done"
        maxLength={30}
      />
    </View>
  );
}

function HealthStep({ colors }: { colors: any }) {
  return (
    <View style={{ paddingTop: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: '700', color: colors.foreground, marginBottom: 8 }}>
        Automated Tracking
      </Text>
      <Text style={{ fontSize: 16, color: colors.muted, marginBottom: 32, lineHeight: 24 }}>
        ThriveIndex reads your health data automatically so you don't have to log everything manually.
      </Text>
      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.border, marginBottom: 24 }}>
        <Text style={{ fontSize: 15, fontWeight: '600', color: colors.foreground, marginBottom: 16 }}>Automatically tracked</Text>
        {[
          { icon: 'moon.fill', label: 'Sleep duration & consistency' },
          { icon: 'figure.walk', label: 'Step count' },
          { icon: 'flame.fill', label: 'Exercise minutes' },
          { icon: 'heart.fill', label: 'Recovery metrics' },
          { icon: 'sun.max.fill', label: 'Outdoor activity' },
        ].map((item) => (
          <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <IconSymbol name={item.icon as any} size={18} color={colors.primary} />
            <Text style={{ fontSize: 15, color: colors.foreground }}>{item.label}</Text>
          </View>
        ))}
      </View>
      <View style={{ backgroundColor: colors.primary + '12', borderRadius: 12, padding: 16 }}>
        <Text style={{ fontSize: 13, color: colors.primary, lineHeight: 20, fontWeight: '500' }}>
          On a real device, ThriveIndex integrates with Apple Health and Apple Watch. In this preview, realistic data is simulated automatically.
        </Text>
      </View>
    </View>
  );
}

function ThresholdsStep({
  colors,
  thresholds,
  setThresholds,
}: {
  colors: any;
  thresholds: typeof DEFAULT_THRESHOLDS;
  setThresholds: (t: typeof DEFAULT_THRESHOLDS) => void;
}) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const items = [
    {
      key: 'sleepHours' as const,
      label: 'Sleep target',
      unit: 'hours',
      min: 5,
      max: 10,
      step: 0.5,
      icon: 'moon.fill',
      evidenceKey: 'sleep' as const,
    },
    {
      key: 'steps' as const,
      label: 'Daily steps',
      unit: 'steps',
      min: 2000,
      max: 15000,
      step: 500,
      icon: 'figure.walk',
      evidenceKey: 'steps' as const,
    },
    {
      key: 'exerciseMinutes' as const,
      label: 'Exercise',
      unit: 'min',
      min: 10,
      max: 90,
      step: 5,
      icon: 'flame.fill',
      evidenceKey: 'exercise' as const,
    },
  ];

  return (
    <View style={{ paddingTop: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: '700', color: colors.foreground, marginBottom: 8 }}>
        Set Your Targets
      </Text>
      <Text style={{ fontSize: 16, color: colors.muted, marginBottom: 32, lineHeight: 24 }}>
        These thresholds are backed by peer-reviewed research. Tap to learn more.
      </Text>
      {items.map((item) => {
        const evidence = EVIDENCE[item.evidenceKey];
        const isExpanded = expandedKey === item.key;
        return (
          <Pressable
            key={item.key}
            onPress={() => setExpandedKey(isExpanded ? null : item.key)}
            style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
          >
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: 20,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <IconSymbol name={item.icon as any} size={20} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground }}>{item.label}</Text>
                  <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>{evidence.recommended}</Text>
                </View>
                <IconSymbol name={isExpanded ? 'chevron.up' : 'chevron.down'} size={16} color={colors.muted} />
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Pressable
                  style={({ pressed }) => [
                    { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
                    pressed && { opacity: 0.6 },
                  ]}
                  onPress={() => {
                    const newVal = Math.max(item.min, thresholds[item.key] - item.step);
                    setThresholds({ ...thresholds, [item.key]: Math.round(newVal * 10) / 10 });
                  }}
                >
                  <IconSymbol name="minus" size={18} color={colors.foreground} />
                </Pressable>
                <Text style={{ fontSize: 22, fontWeight: '700', color: colors.primary }}>
                  {thresholds[item.key]} <Text style={{ fontSize: 14, color: colors.muted, fontWeight: '400' }}>{item.unit}</Text>
                </Text>
                <Pressable
                  style={({ pressed }) => [
                    { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
                    pressed && { opacity: 0.6 },
                  ]}
                  onPress={() => {
                    const newVal = Math.min(item.max, thresholds[item.key] + item.step);
                    setThresholds({ ...thresholds, [item.key]: Math.round(newVal * 10) / 10 });
                  }}
                >
                  <IconSymbol name="plus" size={18} color={colors.foreground} />
                </Pressable>
              </View>

              {isExpanded && (
                <View style={{ marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border, gap: 12 }}>
                  {evidence.findings.map((finding, idx) => (
                    <View key={idx}>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: colors.foreground, marginBottom: 4 }}>
                        {finding.title}
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.muted, lineHeight: 18, marginBottom: 6 }}>
                        {finding.text}
                      </Text>
                      <Text style={{ fontSize: 11, color: colors.primary, fontStyle: 'italic' }}>
                        — {finding.source}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

function PrioritiesStep({
  colors,
  priorities,
  togglePriority,
  allPriorities,
}: {
  colors: any;
  priorities: ProgressCategory[];
  togglePriority: (p: ProgressCategory) => void;
  allPriorities: ProgressCategory[];
}) {
  return (
    <View style={{ paddingTop: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: '700', color: colors.foreground, marginBottom: 8 }}>
        Your Priorities
      </Text>
      <Text style={{ fontSize: 16, color: colors.muted, marginBottom: 32, lineHeight: 24 }}>
        Select the areas of life most important to you. These will appear as tags when logging daily progress.
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {allPriorities.map((p) => {
          const selected = priorities.includes(p);
          return (
            <Pressable
              key={p}
              style={({ pressed }) => [
                {
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderRadius: 100,
                  borderWidth: 1.5,
                  borderColor: selected ? colors.primary : colors.border,
                  backgroundColor: selected ? colors.primary + '15' : colors.surface,
                },
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => togglePriority(p)}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: selected ? '600' : '400',
                  color: selected ? colors.primary : colors.muted,
                }}
              >
                {p}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = (colors: any) =>
  StyleSheet.create({
    progressContainer: {
      height: 3,
      backgroundColor: colors.border,
      marginHorizontal: 0,
    },
    progressBar: {
      height: 3,
      backgroundColor: colors.primary,
    },
    scrollContent: {
      padding: 24,
      paddingBottom: 40,
    },
    navRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      paddingVertical: 16,
      borderTopWidth: 0.5,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
    },
    backBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 8,
    },
    backText: {
      fontSize: 16,
      fontWeight: '600',
    },
    nextBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingHorizontal: 32,
      paddingVertical: 18,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 8,
    },
    nextText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '800',
      letterSpacing: 0.4,
      textShadowColor: 'rgba(0, 0, 0, 0.1)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
  });

// ─── Daily Notification Step ──────────────────────────────────────────────────

function DailyNotificationStep({
  colors,
  time,
  setTime,
}: {
  colors: any;
  time: string;
  setTime: (t: string) => void;
}) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 15, 30, 45];

  const [hour, minute] = time.split(':').map(Number);

  return (
    <View>
      <Text style={{ fontSize: 28, fontWeight: '700', color: colors.foreground, marginBottom: 8 }}>
        Daily Reminder
      </Text>
      <Text style={{ fontSize: 16, color: colors.muted, lineHeight: 24, marginBottom: 24 }}>
        What time would you like to receive your daily reminder to complete your evening reflection?
      </Text>

      <View style={{ gap: 16 }}>
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 8, fontWeight: '600' }}>Hour</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {hours.map((h) => (
                <Pressable
                  key={h}
                  style={({ pressed }) => [
                    {
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderRadius: 10,
                      backgroundColor: h === hour ? colors.primary : colors.surface,
                      borderWidth: 1,
                      borderColor: h === hour ? colors.primary : colors.border,
                      minWidth: 60,
                      alignItems: 'center',
                    },
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={() => setTime(`${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`)}
                >
                  <Text style={{ fontSize: 16, fontWeight: '600', color: h === hour ? '#fff' : colors.foreground }}>
                    {String(h).padStart(2, '0')}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 8, fontWeight: '600' }}>Minute</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {minutes.map((m) => (
                <Pressable
                  key={m}
                  style={({ pressed }) => [
                    {
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderRadius: 10,
                      backgroundColor: m === minute ? colors.primary : colors.surface,
                      borderWidth: 1,
                      borderColor: m === minute ? colors.primary : colors.border,
                      minWidth: 60,
                      alignItems: 'center',
                    },
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={() => setTime(`${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')}`)}
                >
                  <Text style={{ fontSize: 16, fontWeight: '600', color: m === minute ? '#fff' : colors.foreground }}>
                    {String(m).padStart(2, '0')}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginTop: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 4 }}>
            Selected Time
          </Text>
          <Text style={{ fontSize: 24, fontWeight: '700', color: colors.primary }}>
            {String(hour).padStart(2, '0')}:{String(minute).padStart(2, '0')}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─── Weekly Notification Step ─────────────────────────────────────────────────

function WeeklyNotificationStep({
  colors,
  day,
  setDay,
  time,
  setTime,
}: {
  colors: any;
  day: number;
  setDay: (d: number) => void;
  time: string;
  setTime: (t: string) => void;
}) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 15, 30, 45];

  const [hour, minute] = time.split(':').map(Number);

  return (
    <View>
      <Text style={{ fontSize: 28, fontWeight: '700', color: colors.foreground, marginBottom: 8 }}>
        Weekly Reminder
      </Text>
      <Text style={{ fontSize: 16, color: colors.muted, lineHeight: 24, marginBottom: 24 }}>
        When would you like to receive your weekly reminder to complete your weekly check-in?
      </Text>

      <View style={{ gap: 16 }}>
        <View>
          <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 8, fontWeight: '600' }}>Day</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {days.map((d, i) => (
              <Pressable
                key={i}
                style={({ pressed }) => [
                  {
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 10,
                    backgroundColor: i === day ? colors.primary : colors.surface,
                    borderWidth: 1,
                    borderColor: i === day ? colors.primary : colors.border,
                  },
                  pressed && { opacity: 0.8 },
                ]}
                onPress={() => setDay(i)}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: i === day ? '#fff' : colors.foreground }}>
                  {d}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View>
          <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 8, fontWeight: '600' }}>Hour</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {hours.map((h) => (
              <Pressable
                key={h}
                style={({ pressed }) => [
                  {
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 10,
                    backgroundColor: h === hour ? colors.primary : colors.surface,
                    borderWidth: 1,
                    borderColor: h === hour ? colors.primary : colors.border,
                    minWidth: 60,
                    alignItems: 'center',
                  },
                  pressed && { opacity: 0.8 },
                ]}
                onPress={() => setTime(`${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`)}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: h === hour ? '#fff' : colors.foreground }}>
                  {String(h).padStart(2, '0')}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View>
          <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 8, fontWeight: '600' }}>Minute</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {minutes.map((m) => (
              <Pressable
                key={m}
                style={({ pressed }) => [
                  {
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 10,
                    backgroundColor: m === minute ? colors.primary : colors.surface,
                    borderWidth: 1,
                    borderColor: m === minute ? colors.primary : colors.border,
                    minWidth: 60,
                    alignItems: 'center',
                  },
                  pressed && { opacity: 0.8 },
                ]}
                onPress={() => setTime(`${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')}`)}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: m === minute ? '#fff' : colors.foreground }}>
                  {String(m).padStart(2, '0')}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginTop: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 4 }}>
            Selected Time
          </Text>
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.primary }}>
            {days[day]} at {String(hour).padStart(2, '0')}:{String(minute).padStart(2, '0')}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─── Why ThriveIndex Step ─────────────────────────────────────────────────────

function WhyStep({ colors }: { colors: any }) {
  return (
    <View style={{ gap: 24 }}>
      <View style={{ gap: 8 }}>
        <Text style={{ fontSize: 28, fontWeight: '800', color: colors.foreground }}>
          Why ThriveIndex?
        </Text>
        <Text style={{ fontSize: 16, color: colors.muted, lineHeight: 24 }}>
          Most habit trackers focus on one metric. We believe true wellbeing is multidimensional.
        </Text>
      </View>

      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
          <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primary + '20', alignItems: 'center', justifyContent: 'center' }}>
            <IconSymbol name="brain.head.profile" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.foreground, marginBottom: 4 }}>
              Science-Backed
            </Text>
            <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 20 }}>
              Built on peer-reviewed research from sleep, exercise, psychology, and wellbeing studies.
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
          <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primary + '20', alignItems: 'center', justifyContent: 'center' }}>
            <IconSymbol name="sparkles" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.foreground, marginBottom: 4 }}>
              Holistic Scoring
            </Text>
            <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 20 }}>
              Your daily score reflects sleep, movement, sunlight, reflection, and habits—not just one metric.
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
          <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primary + '20', alignItems: 'center', justifyContent: 'center' }}>
            <IconSymbol name="chart.line.uptrend.xyaxis" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.foreground, marginBottom: 4 }}>
              Behavioral Insights
            </Text>
            <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 20 }}>
              Discover what habits drive your best days. See correlations between sleep, exercise, and mood.
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
          <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primary + '20', alignItems: 'center', justifyContent: 'center' }}>
            <IconSymbol name="leaf.fill" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.foreground, marginBottom: 4 }}>
              Consistency Over Perfection
            </Text>
            <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 20 }}>
              Small daily actions compound. We celebrate progress, not perfection.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── Sample Day Step ──────────────────────────────────────────────────────────

function SampleDayStep({ colors }: { colors: any }) {
  return (
    <View style={{ gap: 24 }}>
      <View style={{ gap: 8 }}>
        <Text style={{ fontSize: 28, fontWeight: '800', color: colors.foreground }}>
          Here's a Sample Day
        </Text>
        <Text style={{ fontSize: 16, color: colors.muted, lineHeight: 24 }}>
          This is what a completed day looks like in ThriveIndex.
        </Text>
      </View>

      {/* Sample Score Card */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.muted, marginBottom: 12 }}>
          TODAY'S THRIVE SCORE
        </Text>
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 48, fontWeight: '800', color: '#fff' }}>78</Text>
          </View>
        </View>
        <Text style={{ fontSize: 14, color: colors.muted, textAlign: 'center', marginBottom: 16 }}>
          Great day! You're 12 points above your average.
        </Text>

        {/* Sample Metrics */}
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <IconSymbol name="moon.fill" size={18} color={colors.primary} />
              <Text style={{ fontSize: 14, color: colors.foreground }}>Sleep</Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>7.5 hrs ✓</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <IconSymbol name="figure.walk" size={18} color={colors.primary} />
              <Text style={{ fontSize: 14, color: colors.foreground }}>Steps</Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>8,234 ✓</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <IconSymbol name="flame.fill" size={18} color={colors.primary} />
              <Text style={{ fontSize: 14, color: colors.foreground }}>Exercise</Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>35 min ✓</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <IconSymbol name="sun.max.fill" size={18} color={colors.primary} />
              <Text style={{ fontSize: 14, color: colors.foreground }}>Sunlight</Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>Yes ✓</Text>
          </View>
        </View>

        {/* Reflections */}
        <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.muted, marginBottom: 8 }}>
            EVENING REFLECTION
          </Text>
          <Text style={{ fontSize: 14, color: colors.foreground, lineHeight: 20, marginBottom: 8 }}>
            <Text style={{ fontWeight: '600' }}>Gratitude:</Text> Grateful for a productive meeting and time with friends.
          </Text>
          <Text style={{ fontSize: 14, color: colors.foreground, lineHeight: 20 }}>
            <Text style={{ fontWeight: '600' }}>Progress:</Text> Finished the project ahead of schedule 🎉
          </Text>
        </View>
      </View>

      <View style={{ backgroundColor: colors.primary + '10', borderRadius: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: colors.primary }}>
        <Text style={{ fontSize: 14, color: colors.foreground, lineHeight: 22 }}>
          <Text style={{ fontWeight: '700' }}>Your job:</Text> Log your metrics and reflections each evening. We'll calculate your score and show you patterns over time.
        </Text>
      </View>
    </View>
  );
}
