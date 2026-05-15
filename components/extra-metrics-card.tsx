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
 * Features quick-select buttons on the right for common values.
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

  // Generate quick select options based on target (0, 0.5x, 1x, 1.5x target)
  const getQuickSelectOptions = (target: number): number[] => {
    if (target <= 1) return [0, 1];
    if (target <= 3) return [0, Math.floor(target * 0.5), target];
    return [0, Math.floor(target * 0.5), target, Math.floor(target * 1.5)];
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
          const quickOptions = getQuickSelectOptions(preset_data.defaultTarget);

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
              {/* Header: Icon + Label */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 12,
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

              {/* Input Row + Quick Select Buttons */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {/* Text Input */}
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
                    minWidth: 30,
                  }}
                >
                  {preset_data.unit}
                </Text>

                {/* Quick Select Buttons */}
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {quickOptions.map((option) => (
                    <Pressable
                      key={option}
                      style={({ pressed }) => [
                        styles.quickSelectBtn,
                        {
                          backgroundColor:
                            value === option ? colors.primary : colors.background,
                          borderColor: value === option ? colors.primary : colors.border,
                        },
                        pressed && { opacity: 0.7 },
                      ]}
                      onPress={() => handleValueChange(preset.id, option)}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: '600',
                          color: value === option ? '#fff' : colors.foreground,
                        }}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Progress Bar */}
              <View
                style={{
                  height: 4,
                  backgroundColor: colors.border,
                  borderRadius: 2,
                  marginTop: 10,
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
    padding: 14,
    borderWidth: 1,
  },
  input: {
    width: 50,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  quickSelectBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
