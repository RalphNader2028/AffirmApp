import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { affirmationsService } from './affirmationsService';

// Configure notification behavior
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
  private readonly STORAGE_KEY = 'notificationPreferences';
  private readonly SCHEDULED_NOTIFICATIONS_KEY = 'scheduledNotifications';
  private isScheduling = false;

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      console.log('Notifications not supported on web');
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
        console.log('Failed to get push token for push notification!');
        return false;
      }

      // Configure iOS-specific settings
      if (Platform.OS === 'ios') {
        await Notifications.setNotificationCategoryAsync('affirmation', [
          {
            identifier: 'view',
            buttonTitle: 'View',
            options: {
              opensAppToForeground: true,
            },
          },
        ]);
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  async saveNotificationPreferences(preferences: NotificationPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(preferences));
      
      if (preferences.enabled) {
        await this.scheduleNotifications(preferences);
      } else {
        await this.cancelAllNotifications();
      }
    } catch (error) {
      console.error('Error saving notification preferences:', error);
    }
  }

  async getNotificationPreferences(): Promise<NotificationPreferences> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error getting notification preferences:', error);
    }

    // Default preferences
    return {
      enabled: false,
      startTime: '08:00',
      endTime: '20:00',
    };
  }

  private async scheduleNotifications(preferences: NotificationPreferences): Promise<void> {
    if (Platform.OS === 'web') return;

    // Prevent multiple scheduling operations
    if (this.isScheduling) {
      console.log('Scheduling already in progress, skipping...');
      return;
    }

    try {
      this.isScheduling = true;
      
      // Cancel existing notifications first
      await this.cancelAllNotifications();

      const { startTime, endTime } = preferences;
      
      // Parse time strings
      const [startHour] = startTime.split(':').map(Number);
      const [endHour] = endTime.split(':').map(Number);
      
      // Calculate how many hours in the time range
      let hoursInRange: number;
      if (endHour > startHour) {
        hoursInRange = endHour - startHour;
      } else {
        // Handle case where end time is next day (e.g., 10 PM to 6 AM)
        hoursInRange = (24 - startHour) + endHour;
      }
      
      if (hoursInRange <= 0) {
        console.error('Invalid time range for notifications');
        return;
      }

      const scheduledIds: string[] = [];
      const now = new Date();
      
      console.log(`Current time: ${now.toLocaleString()}`);
      console.log(`Notification range: ${startHour}:00 - ${endHour}:00`);
      
      // Find the next valid notification time (minimum 4 hours from now to be extra safe)
      const minimumHoursFromNow = 4;
      const earliestTime = new Date(now.getTime() + minimumHoursFromNow * 60 * 60 * 1000);
      
      console.log(`Earliest notification time: ${earliestTime.toLocaleString()}`);
      
      // Start from tomorrow to ensure we're well in the future
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() + 1);
      startDate.setHours(startHour, 0, 0, 0);
      
      // If tomorrow's start time is still too soon, start from the day after
      if (startDate.getTime() < earliestTime.getTime()) {
        startDate.setDate(startDate.getDate() + 1);
      }
      
      console.log(`Starting notifications from: ${startDate.toLocaleString()}`);
      
      // Schedule notifications for the next 24 hours only
      let currentTime = new Date(startDate);
      let notificationsScheduled = 0;
      const maxNotifications = hoursInRange; // Only schedule for one day
      
      while (notificationsScheduled < maxNotifications) {
        // Ensure we're within the time range
        const currentHour = currentTime.getHours();
        let isInRange = false;
        
        if (endHour > startHour) {
          isInRange = currentHour >= startHour && currentHour < endHour;
        } else {
          isInRange = currentHour >= startHour || currentHour < endHour;
        }
        
        if (isInRange) {
          // Get a random affirmation
          const affirmations = await affirmationsService.getAffirmationsByCategory('all');
          const randomAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
          
          // Double-check that this time is still in the future
          if (currentTime.getTime() > now.getTime() + (minimumHoursFromNow * 60 * 60 * 1000)) {
            const notificationId = await Notifications.scheduleNotificationAsync({
              content: {
                title: 'Daily Motivation 💪',
                body: randomAffirmation,
                categoryIdentifier: 'affirmation',
                sound: true,
                priority: Notifications.AndroidNotificationPriority.HIGH,
              },
              trigger: {
                date: currentTime,
              },
            });
            
            scheduledIds.push(notificationId);
            notificationsScheduled++;
            
            console.log(`✅ Scheduled notification ${notificationsScheduled} for ${currentTime.toLocaleString()}: ${randomAffirmation.substring(0, 50)}...`);
          } else {
            console.log(`⏭️ Skipping ${currentTime.toLocaleString()} - too soon`);
          }
        }
        
        // Move to next hour
        currentTime.setHours(currentTime.getHours() + 1);
        
        // If we've gone past the end time for today, move to next day's start time
        if (endHour > startHour && currentTime.getHours() >= endHour) {
          currentTime.setDate(currentTime.getDate() + 1);
          currentTime.setHours(startHour, 0, 0, 0);
        } else if (endHour <= startHour && currentTime.getHours() >= endHour && currentTime.getHours() < startHour) {
          currentTime.setHours(startHour, 0, 0, 0);
        }
        
        // Safety check to prevent infinite loop
        if (currentTime.getTime() > now.getTime() + (7 * 24 * 60 * 60 * 1000)) {
          console.log('Safety break: reached 7 days in the future');
          break;
        }
      }
      
      // Store scheduled notification IDs
      await AsyncStorage.setItem(this.SCHEDULED_NOTIFICATIONS_KEY, JSON.stringify(scheduledIds));
      
      console.log(`Successfully scheduled ${scheduledIds.length} notifications for the next 24 hours`);
      
      // Verify what was actually scheduled
      const upcomingNotifications = await Notifications.getAllScheduledNotificationsAsync();
      console.log(`Total scheduled notifications in system: ${upcomingNotifications.length}`);
      
      // Show the next few upcoming notifications
      const sortedNotifications = upcomingNotifications
        .sort((a, b) => {
          const timeA = a.trigger && 'date' in a.trigger ? new Date(a.trigger.date).getTime() : 0;
          const timeB = b.trigger && 'date' in b.trigger ? new Date(b.trigger.date).getTime() : 0;
          return timeA - timeB;
        })
        .slice(0, 3);
      
      console.log('Next 3 notifications:');
      sortedNotifications.forEach((notification, index) => {
        if (notification.trigger && 'date' in notification.trigger) {
          const date = new Date(notification.trigger.date);
          console.log(`${index + 1}. ${date.toLocaleString()}: ${notification.content.body?.substring(0, 50)}...`);
        }
      });
      
    } catch (error) {
      console.error('Error scheduling notifications:', error);
    } finally {
      this.isScheduling = false;
    }
  }

  async cancelAllNotifications(): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await AsyncStorage.removeItem(this.SCHEDULED_NOTIFICATIONS_KEY);
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  }

  async rescheduleNotifications(): Promise<void> {
    try {
      const preferences = await this.getNotificationPreferences();
      if (preferences.enabled) {
        await this.scheduleNotifications(preferences);
      }
    } catch (error) {
      console.error('Error rescheduling notifications:', error);
    }
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