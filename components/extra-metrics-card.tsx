import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
  ScrollView,
} from 'react-native';
import { IconSymbol } from './ui/icon-symbol';
import * as Haptics from 'expo-haptics';
import { EXTRA_METRICS_PRESETS } from '@/lib/science';
import { ExtraMetricEntry } from '@/lib/store';

interface ExtraMetricsCardProps {
  enabledMetrics: string[]; // IDs of enabled metrics from profile
  todayMetrics: ExtraMetricEntry[]; // Today's logged values
  onUpdate: (metrics: ExtraMetricEntry[]) => void;
  colors: any;
}

/**
 * Displays interactive input cards for enabled extra metrics.
 * Users can log their daily progress on optional metrics like water, meditation, etc.
 */
export function ExtraMetricsCard({
  enabledMetrics,
  todayMetrics,
  onUpdate,
  colors,
}: ExtraMetricsCardProps) {
  const [localMetrics, setLocalMetrics] = useState<ExtraMetricEntry[]>(todayMetrics);

  // Get only the presets that are enabled
  const visibleMetrics = EXTRA_METRICS_PRESETS.filter((p) =>
    enabledMetrics.includes(p.id)
  );

  if (visibleMetrics.length === 0) {
    return null; // Don't show section if no metrics enabled
  }

  const handleValueChange = (metricId: string, newValue: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const updated = [...localMetrics];
    const existing = updated.findIndex((m) => m.id === metricId);

    if (existing >= 0) {
      updated[existing].value = Math.max(0, newValue);
    } else {
      updated.push({ id: metricId, value: Math.max(0, newValue), isCustom: false });
    }

    setLocalMetrics(updated);
    onUpdate(updated);
  };

  const getValue = (metricId: string): number => {
    const entry = localMetrics.find((m) => m.id === metricId);
    return entry?.value ?? 0;
  };

  const getPreset = (metricId: string) => {
    return EXTRA_METRICS_PRESETS.find((p) => p.id === metricId);
  };

  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
        Extra Metrics
      </Text>
      <View style={{ gap: 12 }}>
        {visibleMetrics.map((preset) => {
          const value = getValue(preset.id);
          const preset_data = getPreset(preset.id);
          if (!preset_data) return null;

          const pct = Math.min(value / preset_data.defaultTarget, 1);
          const isMet = value >= preset_data.defaultTarget;

          return (
            <View
              key={preset.id}
              style={[
                styles.metricCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              {/* Header: Icon + Label + Value */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      backgroundColor: colors.primary + '15',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconSymbol
                      name={preset_data.icon as any}
                      size={16}
                      color={colors.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: colors.foreground,
                      }}
                    >
                      {preset_data.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: colors.muted,
                        marginTop: 2,
                      }}
                    >
                      Target: {preset_data.defaultTarget} {preset_data.unit}
                    </Text>
                  </View>
                </View>
                {isMet && (
                  <IconSymbol
                    name="checkmark.circle.fill"
                    size={20}
                    color={colors.success}
                  />
                )}
              </View>

              {/* Input + Progress Bar */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <TextInput
                  value={String(value)}
                  onChangeText={(text) => {
                    const num = parseInt(text, 10);
                    if (!isNaN(num)) {
                      handleValueChange(preset.id, num);
                    }
                  }}
                  placeholder="0"
                  placeholderTextColor={colors.muted}
                  keyboardType="number-pad"
                  style={[
                    styles.input,
                    {
                      color: colors.foreground,
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                    },
                  ]}
                />
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.muted,
                    fontWeight: '500',
                    minWidth: 40,
                  }}
                >
                  {preset_data.unit}
                </Text>
              </View>

              {/* Progress Bar */}
              <View
                style={{
                  height: 4,
                  backgroundColor: colors.border,
                  borderRadius: 2,
                  marginTop: 8,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    height: 4,
                    borderRadius: 2,
                    width: `${pct * 100}%`,
                    backgroundColor: isMet ? colors.success : colors.primary,
                  }}
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  metricCard: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: '600',
  },
});
