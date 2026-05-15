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
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useApp } from '@/lib/app-context';
import { DEFAULT_THRESHOLDS, ProgressCategory } from '@/lib/store';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const STEPS = ['welcome', 'philosophy', 'name', 'health', 'thresholds', 'priorities'] as const;
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
    await updateProfile({ thresholds, priorities });
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
          </ScrollView>
        </Animated.View>

        {/* Navigation buttons */}
        <View style={s.navRow}>
          {stepIndex > 0 ? (
            <Pressable style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.6 }]} onPress={goBack}>
              <IconSymbol name="chevron.left" size={20} color={colors.muted} />
              <Text style={[s.backText, { color: colors.muted }]}>Back</Text>
            </Pressable>
          ) : (
            <View style={{ flex: 1 }} />
          )}

          {step !== 'priorities' ? (
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
    <View style={{ alignItems: 'center', paddingTop: 40 }}>
      <View style={[{ width: 80, height: 80, borderRadius: 24, backgroundColor: colors.primary + '20', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }]}>
        <IconSymbol name="chart.line.uptrend.xyaxis" size={40} color={colors.primary} />
      </View>
      <Text style={{ fontSize: 34, fontWeight: '700', color: colors.foreground, textAlign: 'center', marginBottom: 16 }}>
        ThriveIndex
      </Text>
      <Text style={{ fontSize: 17, color: colors.muted, textAlign: 'center', lineHeight: 26, paddingHorizontal: 8 }}>
        A scientifically grounded operating system for a better life.
      </Text>
      <View style={{ marginTop: 48, gap: 16, width: '100%' }}>
        {[
          { icon: 'bolt.fill', text: 'Evidence-based behaviors' },
          { icon: 'chart.bar.fill', text: 'Measurable daily progress' },
          { icon: 'sparkles', text: 'Less than 2 minutes per day' },
        ].map((item) => (
          <View key={item.text} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primary + '15', alignItems: 'center', justifyContent: 'center' }}>
              <IconSymbol name={item.icon as any} size={20} color={colors.primary} />
            </View>
            <Text style={{ fontSize: 16, color: colors.foreground, fontWeight: '500' }}>{item.text}</Text>
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
  const items = [
    {
      key: 'sleepHours' as const,
      label: 'Sleep target',
      unit: 'hours',
      min: 5,
      max: 10,
      step: 0.5,
      icon: 'moon.fill',
    },
    {
      key: 'steps' as const,
      label: 'Daily steps',
      unit: 'steps',
      min: 2000,
      max: 15000,
      step: 500,
      icon: 'figure.walk',
    },
    {
      key: 'exerciseMinutes' as const,
      label: 'Exercise',
      unit: 'min',
      min: 10,
      max: 90,
      step: 5,
      icon: 'flame.fill',
    },
  ];

  return (
    <View style={{ paddingTop: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: '700', color: colors.foreground, marginBottom: 8 }}>
        Set Your Targets
      </Text>
      <Text style={{ fontSize: 16, color: colors.muted, marginBottom: 32, lineHeight: 24 }}>
        These are the thresholds used to calculate your daily score. You can change them anytime.
      </Text>
      {items.map((item) => (
        <View
          key={item.key}
          style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <IconSymbol name={item.icon as any} size={20} color={colors.primary} />
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground }}>{item.label}</Text>
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
        </View>
      ))}
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
      gap: 4,
      paddingVertical: 8,
      paddingHorizontal: 4,
    },
    backText: {
      fontSize: 16,
    },
    nextBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 24,
      paddingVertical: 14,
      borderRadius: 100,
    },
    nextText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
  });
