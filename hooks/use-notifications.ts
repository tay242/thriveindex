import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

/**
 * Hook to schedule and manage daily reminder notifications.
 * - 8 AM: Morning sunlight reminder
 * - 9 PM: Evening reflection reminder
 */
export function useNotifications() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<Notifications.PermissionStatus | null>(null);

  // Request notification permissions
  const requestPermissions = async () => {
    if (Platform.OS === 'web') {
      console.log('Notifications not available on web');
      return;
    }

    try {
      const { status } = await Notifications.requestPermissionsAsync();
      setPermissionStatus(status);
      setNotificationsEnabled(status === 'granted');
      return status === 'granted';
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
      return false;
    }
  };

  // Schedule daily morning reminder (8 AM)
  const scheduleMorningReminder = async () => {
    if (!notificationsEnabled || Platform.OS === 'web') return;

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Schedule 8 AM reminder
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Good morning, friend',
          body: 'Get some morning sunlight to set your circadian rhythm. Just 10-30 minutes.',
          data: { type: 'morning_sunlight' },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          hour: 8,
          minute: 0,
          repeats: true,
        } as any,
      });

      // Schedule 9 PM reminder
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Evening reflection',
          body: 'Take 2 minutes to log your day and reflect on your progress.',
          data: { type: 'evening_reflection' },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          hour: 21,
          minute: 0,
          repeats: true,
        } as any,
      });

      console.log('Daily reminders scheduled');
    } catch (error) {
      console.error('Failed to schedule reminders:', error);
    }
  };

  // Cancel all scheduled notifications
  const cancelReminders = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('Reminders cancelled');
    } catch (error) {
      console.error('Failed to cancel reminders:', error);
    }
  };

  // Set up notification handler
  useEffect(() => {
    if (Platform.OS === 'web') return;

    // Handle notification when app is in foreground
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
    });

    return () => subscription.remove();
  }, []);

  return {
    notificationsEnabled,
    permissionStatus,
    requestPermissions,
    scheduleMorningReminder,
    cancelReminders,
  };
}
