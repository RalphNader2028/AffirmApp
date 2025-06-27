import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { affirmationsService } from './affirmationsService';

// Configure notification behavior for iOS
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export interface NotificationPreferences {
  enabled: boolean;
  startTime: string; // "08:00"
  endTime: string; // "20:00"
}

class NotificationService {
  private readonly STORAGE_KEY = 'scheduledNotifications';
  private readonly PREFERENCES_KEY = 'notificationPreferences';

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      console.log('Notifications only supported on iOS');
      return false;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permissions denied');
        return false;
      }

      await Notifications.setNotificationCategoryAsync('affirmation', [
        {
          identifier: 'view',
          buttonTitle: 'View',
          options: { opensAppToForeground: true },
        },
      ]);

      console.log('Notification permissions granted');
      return true;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  async scheduleNotifications(): Promise<void> {
    if (Platform.OS !== 'ios') {
      console.log('Notifications only supported on iOS');
      return;
    }

    try {
      // Cancel all existing notifications
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All existing notifications cancelled');

      const now = new Date(); // e.g., 2025-06-25 20:49 PDT
      const MINIMUM_SECONDS_FROM_NOW = 300; // 5 minutes
      const earliestValidTime = new Date(now.getTime() + MINIMUM_SECONDS_FROM_NOW * 1000);
      const daysToSchedule = 7;

      // Start from tomorrow at 9 AM
      const startDate = new Date(now);
      startDate.setDate(now.getDate() + 1);
      startDate.setHours(9, 0, 0, 0); // 9 AM tomorrow

      for (let day = 0; day < daysToSchedule; day++) {
        const notificationTime = new Date(startDate);
        notificationTime.setDate(startDate.getDate() + day);

        // Verify future time
        if (notificationTime.getTime() <= earliestValidTime.getTime()) {
          console.log(`⏭️ Skipping ${notificationTime.toLocaleString()} - too soon`);
          continue;
        }

        const affirmations = await affirmationsService.getAffirmationsByCategory('all');
        if (!affirmations.length) {
          console.warn('No affirmations available');
          continue;
        }

        const randomAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];

        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Daily Motivation 💪',
            body: randomAffirmation,
            categoryIdentifier: 'affirmation',
            sound: true,
          },
          trigger: {
            date: notificationTime,
          },
        });

        console.log(`✅ Scheduled notification for ${notificationTime.toLocaleString()} (ID: ${notificationId})`);
      }

      // Verify scheduled notifications
      const upcoming = await Notifications.getAllScheduledNotificationsAsync();
      console.log(`Total scheduled notifications: ${upcoming.length}`);
      upcoming
        .sort((a, b) => (a.trigger?.date || 0) - (b.trigger?.date || 0))
        .forEach((n, i) => {
          console.log(`${i + 1}. ${new Date(n.trigger?.date || 0).toLocaleString()}: ${n.content.body?.substring(0, 50)}...`);
        });

    } catch (error) {
      console.error('Error scheduling notifications:', error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    if (Platform.OS !== 'ios') return;

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await AsyncStorage.removeItem(this.STORAGE_KEY);
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  }

  async rescheduleNotifications(): Promise<void> {
    try {
      await this.scheduleNotifications();
    } catch (error) {
      console.error('Error rescheduling notifications:', error);
    }
  }

  // Keep existing methods for backward compatibility with settings screen
  async saveNotificationPreferences(preferences: NotificationPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem(this.PREFERENCES_KEY, JSON.stringify(preferences));
      
      if (preferences.enabled) {
        await this.scheduleNotifications();
      } else {
        await this.cancelAllNotifications();
      }
    } catch (error) {
      console.error('Error saving notification preferences:', error);
    }
  }

  async getNotificationPreferences(): Promise<NotificationPreferences> {
    try {
      const stored = await AsyncStorage.getItem(this.PREFERENCES_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error getting notification preferences:', error);
    }

    // Default preferences
    return {
      enabled: false,
      startTime: '09:00',
      endTime: '17:00',
    };
  }

  // Helper method to format time for display
  formatTime(time: string): string {
    const [hour, minute] = time.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  }

  // Helper method to parse time from display format
  parseDisplayTime(displayTime: string): string {
    const [time, period] = displayTime.split(' ');
    const [hour, minute] = time.split(':').map(Number);
    let hour24 = hour;
    
    if (period === 'PM' && hour !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hour === 12) {
      hour24 = 0;
    }
    
    return `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  }
}

export const notificationService = new NotificationService();