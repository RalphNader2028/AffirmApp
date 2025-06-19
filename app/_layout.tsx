import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { notificationService } from '@/services/notificationService';
import { Platform } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
  });

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        // TEMPORARILY RESET ONBOARDING TO SHOW NEW NOTIFICATION FLOW
        // Remove this line after testing the new onboarding flow
        await AsyncStorage.removeItem('onboardingCompleted');
        
        const completed = await AsyncStorage.getItem('onboardingCompleted');
        setIsOnboardingComplete(completed === 'true');
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setIsOnboardingComplete(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    // Navigate to appropriate screen once we know onboarding status
    if (isOnboardingComplete !== null && (fontsLoaded || fontError)) {
      if (!isOnboardingComplete) {
        router.replace('/onboarding');
      } else {
        router.replace('/');
      }
    }
  }, [isOnboardingComplete, fontsLoaded, fontError]);

  // Set up notification listeners
  useEffect(() => {
    if (Platform.OS === 'web') return;

    let isMounted = true;
    let isSchedulingInProgress = false;

    // Handle notification received while app is in foreground
    const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
      // IMPORTANT: Ignore notifications that are received immediately after scheduling
      // This prevents the flood of notifications during setup
      if (isSchedulingInProgress) {
        console.log('Ignoring notification received during scheduling setup');
        return;
      }
      
      // Only process notifications that have a proper trigger date in the future
      const now = new Date();
      const notificationTime = notification.date;
      
      // If the notification was received within 10 seconds of "now", it's likely an immediate delivery
      // from the scheduling process, so ignore it
      if (Math.abs(notificationTime - now.getTime()) < 10000) {
        console.log('Ignoring immediate notification delivery');
        return;
      }
      
      console.log('Processing legitimate notification:', notification);
    });

    // Handle notification response (when user taps notification)
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      // Navigate to main screen when notification is tapped
      if (isMounted) {
        router.push('/');
      }
    });

    // Reschedule notifications daily to ensure they stay active
    const scheduleDaily = async () => {
      try {
        isSchedulingInProgress = true;
        await notificationService.rescheduleNotifications();
        // Wait a bit before allowing notifications to be processed
        setTimeout(() => {
          isSchedulingInProgress = false;
        }, 2000);
      } catch (error) {
        console.error('Error rescheduling notifications:', error);
        isSchedulingInProgress = false;
      }
    };

    // Schedule notifications on app start
    scheduleDaily();

    return () => {
      isMounted = false;
      foregroundSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (isOnboardingComplete === null) {
    return null; // Keep splash screen while checking onboarding status
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="index" />
        <Stack.Screen name="settings-modal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}