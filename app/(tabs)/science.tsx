import { ScrollView, Text, View, Pressable, StyleSheet } from 'react-native';
import { useState } from 'react';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { CORE_METRICS_SCIENCE } from '@/lib/science';

const METRICS_ORDER = ['sleep', 'steps', 'exercise', 'sunlight'];

export default function ScienceScreen() {
  const colors = useColors();
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);

  const toggleMetric = (metricId: string) => {
    setExpandedMetric(expandedMetric === metricId ? null : metricId);
  };

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[s.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Text style={[s.headerTitle, { color: colors.foreground }]}>The Science</Text>
          <Text style={[s.headerSubtitle, { color: colors.muted }]}>
            Why we track what we track
          </Text>
        </View>

        {/* Intro */}
        <View style={[s.intro, { backgroundColor: colors.background }]}>
          <Text style={[s.introText, { color: colors.foreground }]}>
            ThriveIndex is built on peer-reviewed research and evidence-based wellbeing science. Each metric you track has been shown to meaningfully impact longevity, mental health, and quality of life.
          </Text>
        </View>

        {/* Core Metrics */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 24 }}>
          <Text style={[s.sectionTitle, { color: colors.foreground }]}>Core Metrics</Text>

          {METRICS_ORDER.map((metricId) => {
            const metric = CORE_METRICS_SCIENCE[metricId];
            const isExpanded = expandedMetric === metricId;

            return (
              <Pressable
                key={metricId}
                onPress={() => toggleMetric(metricId)}
                style={({ pressed }) => [
                  s.metricCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <View style={s.metricHeader}>
                  <View style={{ flex: 1, gap: 8, flexDirection: 'row', alignItems: 'center' }}>
                    <IconSymbol name={metric.icon as any} size={24} color={colors.primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={[s.metricTitle, { color: colors.foreground }]}>{metric.title}</Text>
                      <Text style={[s.metricDesc, { color: colors.muted }]}>{metric.description}</Text>
                    </View>
                  </View>
                  <IconSymbol
                    name={isExpanded ? 'chevron.up' : 'chevron.down'}
                    size={20}
                    color={colors.muted}
                  />
                </View>

                {isExpanded && (
                  <View style={{ marginTop: 16, gap: 12, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border }}>
                    {/* Why It Matters */}
                    <View>
                      <Text style={[s.subheading, { color: colors.foreground }]}>Why It Matters</Text>
                      <Text style={[s.bodyText, { color: colors.foreground }]}>{metric.whyItMatters}</Text>
                    </View>

                    {/* Key Findings */}
                    <View>
                      <Text style={[s.subheading, { color: colors.foreground }]}>Key Findings</Text>
                      {metric.keyFindings.map((finding, idx) => (
                        <View key={idx} style={{ marginBottom: 8, flexDirection: 'row', gap: 8 }}>
                          <Text style={[s.bullet, { color: colors.primary }]}>•</Text>
                          <Text style={[s.finding, { color: colors.foreground, flex: 1 }]}>{finding}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Citations */}
                    <View>
                      <Text style={[s.subheading, { color: colors.foreground }]}>Research Sources</Text>
                      {metric.citations.map((citation, idx) => (
                        <View key={idx} style={{ marginBottom: 12 }}>
                          <Text style={[s.citationText, { color: colors.foreground }]}>
                            {citation.text}
                          </Text>
                          <Text style={[s.citationSource, { color: colors.muted }]}>
                            {citation.source}
                            {citation.year ? ` (${citation.year})` : ''}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Disclaimer */}
        <View style={[s.disclaimer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <Text style={[s.disclaimerText, { color: colors.muted }]}>
            This information is for educational purposes. Always consult with healthcare professionals before making significant changes to your health routine.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  intro: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  introText: {
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  metricCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  metricDesc: {
    fontSize: 12,
  },
  subheading: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 13,
    lineHeight: 18,
  },
  finding: {
    fontSize: 13,
    lineHeight: 18,
  },
  bullet: {
    fontSize: 16,
    fontWeight: '700',
  },
  citationText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  citationSource: {
    fontSize: 11,
    marginTop: 2,
  },
  disclaimer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    marginTop: 24,
  },
  disclaimerText: {
    fontSize: 12,
    lineHeight: 16,
  },
});
