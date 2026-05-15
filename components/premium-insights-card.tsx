import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { IconSymbol } from './ui/icon-symbol';
import * as Haptics from 'expo-haptics';
import { trpc } from '@/lib/trpc';

interface PremiumInsightsCardProps {
  isPremium: boolean;
  metrics: Array<{
    name: string;
    values: number[];
    average: number;
  }>;
  colors: any;
}

/**
 * Premium AI-powered correlation insights card.
 * Analyzes metric patterns and provides personalized recommendations.
 * Only available to premium users.
 */
export function PremiumInsightsCard({
  isPremium,
  metrics,
  colors,
}: PremiumInsightsCardProps) {
  const [insights, setInsights] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);

  const generateMutation = trpc.insights.generateCorrelations.useMutation({
    onSuccess: (result) => {
      if (result.insights && result.insights.length > 0) {
        setInsights(result.insights);
        setExpanded(true);
      }
    },
    onError: (error) => {
      console.error('Failed to generate insights:', error);
    },
  });

  const handleGenerateInsights = async () => {
    if (!isPremium || metrics.length === 0) return;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    await generateMutation.mutateAsync({
      metrics,
      isPremium: true,
    });
  };

  if (!isPremium) {
    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.primary + '10',
            borderColor: colors.primary,
          },
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              backgroundColor: colors.primary + '20',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconSymbol name="sparkles" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>
              AI Correlation Analysis
            </Text>
            <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
              Upgrade to premium to unlock personalized insights
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const isLoading = generateMutation.isPending;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <Pressable
        style={({ pressed }) => [
          {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          },
          pressed && { opacity: 0.7 },
        ]}
        onPress={() => {
          if (expanded) {
            setExpanded(false);
          } else if (insights.length === 0 && !isLoading) {
            handleGenerateInsights();
          } else {
            setExpanded(!expanded);
          }
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: colors.primary + '20',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <IconSymbol name="sparkles" size={20} color={colors.primary} />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>
            {isLoading ? 'Analyzing...' : 'AI Correlation Analysis'}
          </Text>
          <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
            {insights.length > 0
              ? `${insights.length} insights generated`
              : 'Tap to generate personalized insights'}
          </Text>
        </View>
        <IconSymbol
          name={expanded ? 'chevron.up' : 'chevron.down'}
          size={16}
          color={colors.muted}
        />
      </Pressable>

      {expanded && insights.length > 0 && (
        <View style={{ marginTop: 16, gap: 10 }}>
          {insights.map((insight, idx) => (
            <View
              key={idx}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 10,
                backgroundColor: colors.background,
                borderRadius: 8,
                borderLeftWidth: 3,
                borderLeftColor: colors.primary,
              }}
            >
              <Text style={{ fontSize: 13, color: colors.foreground, lineHeight: 20 }}>
                {insight}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
});
