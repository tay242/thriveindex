import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { IconSymbol } from './ui/icon-symbol';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

interface SyncStatusBadgeProps {
  isOnline: boolean;
  hasPendingSync: boolean;
  colors: any;
  onRetrySync?: () => void;
}

/**
 * Displays the current sync/offline status of the app.
 * Shows:
 * - "Syncing..." when online with pending changes
 * - "Offline" when no internet connection
 * - Nothing when online and synced
 */
export function SyncStatusBadge({
  isOnline,
  hasPendingSync,
  colors,
  onRetrySync,
}: SyncStatusBadgeProps) {
  // Only show badge if offline or syncing
  if (isOnline && !hasPendingSync) {
    return null;
  }

  const isOffline = !isOnline;
  const isSyncing = isOnline && hasPendingSync;

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onRetrySync?.();
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.badge,
        {
          backgroundColor: isOffline ? colors.error + '15' : colors.warning + '15',
          borderColor: isOffline ? colors.error : colors.warning,
        },
        pressed && { opacity: 0.7 },
      ]}
      onPress={handlePress}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {isSyncing && (
          <Text style={{ fontSize: 12, opacity: 0.7 }}>⟳</Text>
        )}
        {isOffline && (
          <IconSymbol
            name="wifi.slash"
            size={14}
            color={colors.error}
          />
        )}
        <Text
          style={{
            fontSize: 12,
            fontWeight: '500',
            color: isOffline ? colors.error : colors.warning,
          }}
        >
          {isSyncing ? 'Syncing...' : 'Offline'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
});
