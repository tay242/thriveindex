import { ScrollView, Text, View, Pressable, StyleSheet, TextInput, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useApp } from '@/lib/app-context';
import { EXTRA_METRICS_PRESETS } from '@/lib/science';
import { CustomMetric } from '@/lib/store';

export default function ExtraMetricsSettingsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { profile, updateProfile } = useApp();
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customUnit, setCustomUnit] = useState('');
  const [customTarget, setCustomTarget] = useState('');

  const enabledMetrics = profile.enabledExtraMetrics || [];
  const customMetrics = profile.customMetrics || [];

  const toggleMetric = async (metricId: string) => {
    if (!profile) return;

    const newEnabled = enabledMetrics.includes(metricId)
      ? enabledMetrics.filter((id) => id !== metricId)
      : [...enabledMetrics, metricId];

    await updateProfile({ enabledExtraMetrics: newEnabled });
  };

  const addCustomMetric = async () => {
    if (!customName.trim() || !customUnit.trim() || !customTarget.trim()) {
      Alert.alert('Missing fields', 'Please fill in all fields');
      return;
    }

    const newMetric: CustomMetric = {
      id: `custom_${Date.now()}`,
      name: customName,
      unit: customUnit,
      icon: 'star.fill',
      defaultTarget: parseInt(customTarget, 10),
      createdAt: new Date().toISOString(),
    };

    const updated = [...customMetrics, newMetric];
    await updateProfile({ customMetrics: updated });

    setCustomName('');
    setCustomUnit('');
    setCustomTarget('');
    setShowCustomForm(false);
  };

  const deleteCustomMetric = async (metricId: string) => {
    Alert.alert('Delete Metric', 'Are you sure?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Delete',
        onPress: async () => {
          const updated = customMetrics.filter((m) => m.id !== metricId);
          await updateProfile({ customMetrics: updated });
        },
      },
    ]);
  };

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[s.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()} style={{ padding: 8 }}>
            <IconSymbol name="chevron.left" size={24} color={colors.primary} />
          </Pressable>
          <Text style={[s.headerTitle, { color: colors.foreground }]}>Extra Metrics</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Preset Metrics */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 20 }}>
          <Text style={[s.sectionTitle, { color: colors.foreground }]}>Preset Metrics</Text>
          <Text style={[s.sectionDesc, { color: colors.muted }]}>
            Enable metrics you want to track in addition to your core metrics.
          </Text>

          {EXTRA_METRICS_PRESETS.map((preset) => {
            const isEnabled = enabledMetrics.includes(preset.id);
            return (
              <Pressable
                key={preset.id}
                onPress={() => toggleMetric(preset.id)}
                style={({ pressed }) => [
                  s.metricRow,
                  {
                    backgroundColor: isEnabled ? colors.primary : colors.surface,
                    borderColor: colors.border,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                  <IconSymbol
                    name={preset.icon as any}
                    size={24}
                    color={isEnabled ? colors.background : colors.primary}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[s.metricName, { color: isEnabled ? colors.background : colors.foreground }]}>
                      {preset.name}
                    </Text>
                    <Text style={[s.metricInfo, { color: isEnabled ? colors.background : colors.muted }]}>
                      Target: {preset.defaultTarget} {preset.unit}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    s.checkbox,
                    {
                      backgroundColor: isEnabled ? colors.background : colors.border,
                      borderColor: isEnabled ? colors.background : colors.border,
                    },
                  ]}
                >
                  {isEnabled && <IconSymbol name="checkmark" size={16} color={colors.primary} />}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Custom Metrics */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 20, borderTopWidth: 1, borderTopColor: colors.border }}>
          <Text style={[s.sectionTitle, { color: colors.foreground }]}>Custom Metrics</Text>
          <Text style={[s.sectionDesc, { color: colors.muted }]}>
            Create your own metrics to track anything that matters to you.
          </Text>

          {customMetrics.map((metric) => (
            <View key={metric.id} style={[s.customMetricCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[s.metricName, { color: colors.foreground }]}>{metric.name}</Text>
                <Text style={[s.metricInfo, { color: colors.muted }]}>
                  Target: {metric.defaultTarget} {metric.unit}
                </Text>
              </View>
              <Pressable onPress={() => deleteCustomMetric(metric.id)} style={{ padding: 8 }}>
                <IconSymbol name="trash.fill" size={20} color={colors.error} />
              </Pressable>
            </View>
          ))}

          {!showCustomForm ? (
            <Pressable
              onPress={() => setShowCustomForm(true)}
              style={({ pressed }) => [
                s.addButton,
                {
                  backgroundColor: colors.primary,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <IconSymbol name="plus" size={20} color={colors.background} />
              <Text style={[s.addButtonText, { color: colors.background }]}>Add Custom Metric</Text>
            </Pressable>
          ) : (
            <View style={[s.formCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TextInput
                placeholder="Metric name (e.g., 'Pushups')"
                value={customName}
                onChangeText={setCustomName}
                placeholderTextColor={colors.muted}
                style={[s.input, { color: colors.foreground, borderColor: colors.border }]}
              />
              <TextInput
                placeholder="Unit (e.g., 'reps', 'minutes')"
                value={customUnit}
                onChangeText={setCustomUnit}
                placeholderTextColor={colors.muted}
                style={[s.input, { color: colors.foreground, borderColor: colors.border }]}
              />
              <TextInput
                placeholder="Daily target (e.g., '20')"
                value={customTarget}
                onChangeText={setCustomTarget}
                keyboardType="number-pad"
                placeholderTextColor={colors.muted}
                style={[s.input, { color: colors.foreground, borderColor: colors.border }]}
              />

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Pressable
                  onPress={() => {
                    setShowCustomForm(false);
                    setCustomName('');
                    setCustomUnit('');
                    setCustomTarget('');
                  }}
                  style={({ pressed }) => [
                    s.formButton,
                    { backgroundColor: colors.border, opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <Text style={[s.formButtonText, { color: colors.foreground }]}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={addCustomMetric}
                  style={({ pressed }) => [
                    s.formButton,
                    { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1, flex: 1 },
                  ]}
                >
                  <Text style={[s.formButtonText, { color: colors.background }]}>Create</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 12,
    marginBottom: 12,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  metricName: {
    fontSize: 14,
    fontWeight: '600',
  },
  metricInfo: {
    fontSize: 12,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customMetricCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
    marginTop: 12,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  formCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    gap: 12,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  formButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  formButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
