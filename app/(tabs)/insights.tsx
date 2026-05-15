import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { PremiumInsightsCard } from '@/components/premium-insights-card';
import { useColors } from '@/hooks/use-colors';
import { useApp } from '@/lib/app-context';
import { DailyEntry } from '@/lib/store';
import Svg, { Rect, Line, Text as SvgText, Circle, Polyline, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 40;
const CHART_HEIGHT = 140;
const PADDING = { top: 16, bottom: 32, left: 32, right: 16 };

// ─── Bar Chart ────────────────────────────────────────────────────────────────

function BarChart({ data, colors }: { data: { label: string; value: number; max: number }[]; colors: any }) {
  const innerW = CHART_WIDTH - PADDING.left - PADDING.right;
  const innerH = CHART_HEIGHT - PADDING.top - PADDING.bottom;
  const barWidth = Math.max(8, (innerW / data.length) * 0.6);
  const gap = innerW / data.length;

  return (
    <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
      {/* Y axis line */}
      <Line
        x1={PADDING.left} y1={PADDING.top}
        x2={PADDING.left} y2={PADDING.top + innerH}
        stroke={colors.border} strokeWidth={1}
      />
      {/* X axis line */}
      <Line
        x1={PADDING.left} y1={PADDING.top + innerH}
        x2={PADDING.left + innerW} y2={PADDING.top + innerH}
        stroke={colors.border} strokeWidth={1}
      />
      {data.map((d, i) => {
        const pct = d.max > 0 ? Math.min(d.value / d.max, 1) : 0;
        const barH = Math.max(2, pct * innerH);
        const x = PADDING.left + gap * i + gap / 2 - barWidth / 2;
        const y = PADDING.top + innerH - barH;
        const isGood = pct >= 0.8;
        return (
          <React.Fragment key={i}>
            <Rect
              x={x} y={y} width={barWidth} height={barH}
              rx={4} ry={4}
              fill={isGood ? colors.success : pct >= 0.5 ? colors.primary : colors.muted}
              opacity={0.85}
            />
            <SvgText
              x={x + barWidth / 2} y={PADDING.top + innerH + 16}
              fontSize={10} fill={colors.muted} textAnchor="middle"
            >
              {d.label}
            </SvgText>
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

// ─── Line Chart ───────────────────────────────────────────────────────────────

function LineChart({ data, colors }: { data: { label: string; value: number }[]; colors: any }) {
  if (data.length < 2) return null;
  const innerW = CHART_WIDTH - PADDING.left - PADDING.right;
  const innerH = CHART_HEIGHT - PADDING.top - PADDING.bottom;
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  const points = data.map((d, i) => {
    const x = PADDING.left + (i / (data.length - 1)) * innerW;
    const y = PADDING.top + innerH - (d.value / maxVal) * innerH;
    return { x, y, ...d };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
      <Defs>
        <LinearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.primary} stopOpacity="0.3" />
          <Stop offset="1" stopColor={colors.primary} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      {/* Grid lines */}
      {[0.25, 0.5, 0.75, 1].map((pct) => (
        <Line
          key={pct}
          x1={PADDING.left} y1={PADDING.top + innerH * (1 - pct)}
          x2={PADDING.left + innerW} y2={PADDING.top + innerH * (1 - pct)}
          stroke={colors.border} strokeWidth={0.5} strokeDasharray="4,4"
        />
      ))}
      {/* Y axis */}
      <Line x1={PADDING.left} y1={PADDING.top} x2={PADDING.left} y2={PADDING.top + innerH} stroke={colors.border} strokeWidth={1} />
      {/* X axis */}
      <Line x1={PADDING.left} y1={PADDING.top + innerH} x2={PADDING.left + innerW} y2={PADDING.top + innerH} stroke={colors.border} strokeWidth={1} />
      {/* Line */}
      <Polyline points={polylinePoints} fill="none" stroke={colors.primary} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Dots + labels */}
      {points.map((p, i) => (
        <React.Fragment key={i}>
          <Circle cx={p.x} cy={p.y} r={4} fill={colors.primary} />
          {(i === 0 || i === points.length - 1 || i % Math.ceil(points.length / 5) === 0) && (
            <SvgText x={p.x} y={PADDING.top + innerH + 16} fontSize={10} fill={colors.muted} textAnchor="middle">
              {p.label}
            </SvgText>
          )}
        </React.Fragment>
      ))}
    </Svg>
  );
}

// ─── Insight Card ─────────────────────────────────────────────────────────────

function InsightCard({ icon, text, colors }: { icon: string; text: string; colors: any }) {
  return (
    <View style={[insightStyles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: colors.primary + '15', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
        <IconSymbol name={icon as any} size={16} color={colors.primary} />
      </View>
      <Text style={{ flex: 1, fontSize: 14, color: colors.foreground, lineHeight: 22 }}>{text}</Text>
    </View>
  );
}

const insightStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
});

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, unit, icon, colors }: { label: string; value: string; unit: string; icon: string; colors: any }) {
  return (
    <View style={[{ flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border }]}>
      <IconSymbol name={icon as any} size={18} color={colors.primary} />
      <Text style={{ fontSize: 22, fontWeight: '700', color: colors.foreground, marginTop: 10 }}>{value}</Text>
      <Text style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>{unit}</Text>
      <Text style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>{label}</Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function InsightsScreen() {
  const colors = useColors();
  const { allDailyEntries, profile } = useApp();

  const last14 = useMemo(() => {
    const sorted = [...allDailyEntries].sort((a, b) => a.date.localeCompare(b.date));
    return sorted.slice(-14);
  }, [allDailyEntries]);

  const last7 = last14.slice(-7);

  // Score trend data
  const scoreTrend = last14.map((e) => ({
    label: e.date.slice(5), // MM-DD
    value: e.dailyScore,
  }));

  // Sleep bar data
  const sleepData = last7.map((e) => ({
    label: e.date.slice(5),
    value: e.sleepHours,
    max: profile.thresholds.sleepHours * 1.3,
  }));

  // Steps bar data
  const stepsData = last7.map((e) => ({
    label: e.date.slice(5),
    value: e.steps,
    max: profile.thresholds.steps * 1.5,
  }));

  // Stats
  const avgScore = last7.length > 0
    ? Math.round(last7.reduce((s, e) => s + e.dailyScore, 0) / last7.length)
    : 0;

  const avgSleep = last7.length > 0
    ? (last7.reduce((s, e) => s + e.sleepHours, 0) / last7.length).toFixed(1)
    : '0';

  const avgSteps = last7.length > 0
    ? Math.round(last7.reduce((s, e) => s + e.steps, 0) / last7.length).toLocaleString()
    : '0';

  const bestScore = last14.length > 0
    ? Math.max(...last14.map((e) => e.dailyScore))
    : 0;

  // Behavioral insights
  const insights = useMemo(() => {
    const result: string[] = [];
    if (last14.length < 5) return ['Log more days to unlock personalized behavioral insights.'];

    // Sleep vs score
    const highSleepDays = last14.filter((e) => e.sleepHours >= profile.thresholds.sleepHours);
    const lowSleepDays = last14.filter((e) => e.sleepHours < profile.thresholds.sleepHours);
    if (highSleepDays.length >= 3 && lowSleepDays.length >= 3) {
      const avgHigh = highSleepDays.reduce((s, e) => s + e.dailyScore, 0) / highSleepDays.length;
      const avgLow = lowSleepDays.reduce((s, e) => s + e.dailyScore, 0) / lowSleepDays.length;
      if (avgHigh > avgLow + 5) {
        result.push(`Your Thrive Score averages ${Math.round(avgHigh)} on days you hit your sleep target, vs ${Math.round(avgLow)} on days you don't.`);
      }
    }

    // Steps vs score
    const highStepDays = last14.filter((e) => e.steps >= profile.thresholds.steps);
    const lowStepDays = last14.filter((e) => e.steps < profile.thresholds.steps);
    if (highStepDays.length >= 3 && lowStepDays.length >= 3) {
      const avgHigh = highStepDays.reduce((s, e) => s + e.dailyScore, 0) / highStepDays.length;
      const avgLow = lowStepDays.reduce((s, e) => s + e.dailyScore, 0) / lowStepDays.length;
      if (avgHigh > avgLow + 5) {
        result.push(`Your highest Thrive Scores happen on days with ${profile.thresholds.steps.toLocaleString()}+ steps.`);
      }
    }

    // Sunlight
    const sunlightDays = last14.filter((e) => e.morningSunlight === true);
    if (sunlightDays.length >= 3) {
      const avgSun = sunlightDays.reduce((s, e) => s + e.dailyScore, 0) / sunlightDays.length;
      const noSunDays = last14.filter((e) => e.morningSunlight === false);
      if (noSunDays.length >= 2) {
        const avgNoSun = noSunDays.reduce((s, e) => s + e.dailyScore, 0) / noSunDays.length;
        if (avgSun > avgNoSun + 5) {
          result.push(`Morning sunlight correlates with a ${Math.round(avgSun - avgNoSun)}-point higher daily score on average.`);
        }
      }
    }

    // Gratitude
    const gratitudeDays = last14.filter((e) => {
      if (!e.gratitude) return false;
      if (Array.isArray(e.gratitude)) return e.gratitude.some(g => g.trim().length > 0);
      return e.gratitude.trim().length > 0;
    });
    if (gratitudeDays.length >= 4) {
      result.push(`You've logged gratitude on ${gratitudeDays.length} of the last 14 days — consistency here is associated with reduced negative attentional bias.`);
    }

    if (result.length === 0) {
      result.push('Keep tracking consistently to unlock personalized behavioral insights based on your own data.');
    }

    return result;
  }, [last14, profile.thresholds]);

  const s = styles(colors);

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>Insights</Text>
          <Text style={s.subtitle}>Your behavioral patterns over time.</Text>
        </View>

        {/* Stats row */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 28 }}>
          <StatCard label="7-day avg" value={String(avgScore)} unit="score" icon="chart.bar.fill" colors={colors} />
          <StatCard label="7-day avg" value={avgSleep as string} unit="hrs sleep" icon="moon.fill" colors={colors} />
          <StatCard label="Personal best" value={String(bestScore)} unit="score" icon="trophy.fill" colors={colors} />
        </View>

        {/* Score Trend */}
        <Text style={s.sectionTitle}>14-Day Score Trend</Text>
        <View style={[s.chartCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {scoreTrend.length >= 2 ? (
            <LineChart data={scoreTrend} colors={colors} />
          ) : (
            <View style={{ height: CHART_HEIGHT, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: colors.muted, fontSize: 14 }}>Log more days to see your trend.</Text>
            </View>
          )}
        </View>

        {/* Sleep */}
        <Text style={s.sectionTitle}>Sleep (Last 7 Days)</Text>
        <View style={[s.chartCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {sleepData.length > 0 ? (
            <BarChart data={sleepData} colors={colors} />
          ) : (
            <View style={{ height: CHART_HEIGHT, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: colors.muted, fontSize: 14 }}>No data yet.</Text>
            </View>
          )}
          <Text style={{ fontSize: 12, color: colors.muted, marginTop: 8 }}>
            Target: {profile.thresholds.sleepHours} hrs · 7-day avg: {avgSleep} hrs
          </Text>
        </View>

        {/* Steps */}
        <Text style={s.sectionTitle}>Steps (Last 7 Days)</Text>
        <View style={[s.chartCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {stepsData.length > 0 ? (
            <BarChart data={stepsData} colors={colors} />
          ) : (
            <View style={{ height: CHART_HEIGHT, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: colors.muted, fontSize: 14 }}>No data yet.</Text>
            </View>
          )}
          <Text style={{ fontSize: 12, color: colors.muted, marginTop: 8 }}>
            Target: {profile.thresholds.steps.toLocaleString()} steps · 7-day avg: {avgSteps}
          </Text>
        </View>

        {/* AI Correlation Insights (Premium) */}
        <PremiumInsightsCard
          isPremium={profile.isPremium}
          metrics={[
            {
              name: 'Daily Score',
              values: last14.map((e) => e.dailyScore),
              average: last14.length > 0
                ? last14.reduce((s, e) => s + e.dailyScore, 0) / last14.length
                : 0,
            },
            {
              name: 'Sleep',
              values: last14.map((e) => e.sleepHours),
              average: last14.length > 0
                ? last14.reduce((s, e) => s + e.sleepHours, 0) / last14.length
                : 0,
            },
            {
              name: 'Steps',
              values: last14.map((e) => e.steps),
              average: last14.length > 0
                ? last14.reduce((s, e) => s + e.steps, 0) / last14.length
                : 0,
            },
            {
              name: 'Exercise',
              values: last14.map((e) => e.exerciseMinutes),
              average: last14.length > 0
                ? last14.reduce((s, e) => s + e.exerciseMinutes, 0) / last14.length
                : 0,
            },
          ]}
          colors={colors}
        />

        {/* Behavioral Insights */}
        <Text style={s.sectionTitle}>Behavioral Insights</Text>
        {insights.map((insight, i) => (
          <InsightCard
            key={i}
            icon={i === 0 ? 'lightbulb.fill' : i === 1 ? 'chart.line.uptrend.xyaxis' : 'sparkles'}
            text={insight}
            colors={colors}
          />
        ))}

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
    sectionTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.muted,
      letterSpacing: 1,
      marginBottom: 12,
      textTransform: 'uppercase',
    },
    chartCard: {
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      marginBottom: 24,
    },
  });
