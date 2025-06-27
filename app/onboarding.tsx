import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { router } from 'expo-router';
import { ChevronLeft, Target, Zap, Clock, Brain, Shield, Trophy, CircleCheck as CheckCircle, Circle, Bell, Plus, Minus } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationService, NotificationPreferences } from '@/services/notificationService';

const { width } = Dimensions.get('window');

const IMPROVEMENT_AREAS = [
  {
    id: 'proactive',
    title: 'Be More Proactive',
    description: 'Take charge and act without waiting for permission or perfect conditions',
    icon: Target,
    color: '#ef4444',
  },
  {
    id: 'productivity',
    title: 'Boost Productivity',
    description: 'Cut distractions, get shit done, and maximize output',
    icon: Zap,
    color: '#f59e0b',
  },
  {
    id: 'discipline',
    title: 'Practice Self-Discipline',
    description: 'Stay committed, avoid procrastination, and follow through',
    icon: Shield,
    color: '#8b5cf6',
  },
  {
    id: 'time',
    title: 'Improve Time Management',
    description: 'Prioritize ruthlessly and own your schedule',
    icon: Clock,
    color: '#06b6d4',
  },
  {
    id: 'resilience',
    title: 'Strengthen Resilience',
    description: 'Toughen up to handle setbacks without breaking',
    icon: Shield,
    color: '#10b981',
  },
  {
    id: 'goals',
    title: 'Set and Achieve Goals',
    description: 'Define clear targets and crush them with focus',
    icon: Trophy,
    color: '#f97316',
  },
  {
    id: 'decisions',
    title: 'Enhance Decision-Making',
    description: 'Make bold, confident choices without second-guessing',
    icon: Brain,
    color: '#ec4899',
  },
  {
    id: 'habits',
    title: 'Build Better Habits',
    description: 'Forge routines that drive success, no excuses',
    icon: CheckCircle,
    color: '#6366f1',
  },
];

const ONBOARDING_STEPS = [
  {
    title: "Ready for the harsh truth?",
    subtitle: "Finally, affirmations that don't sugarcoat reality",
    content: ""
  },
  {
    title: "No More Excuses",
    subtitle: "Affirmations that challenge you to act",
    content: ""
  },
  {
    title: "Choose Your Battle",
    subtitle: "Select the areas where you need to level up",
    content: ""
  }
];

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [isCompleting, setIsCompleting] = useState(false);
  
  // Notification preferences state (simplified - no frequency)
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
    enabled: true,
    startTime: '08:00',
    endTime: '20:00',
  });

  const handleNext = () => {
    console.log('handleNext called, currentStep:', currentStep);
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === ONBOARDING_STEPS.length - 1) {
      // Move to area selection
      console.log('Moving to area selection');
      setCurrentStep(ONBOARDING_STEPS.length);
    } else if (currentStep === ONBOARDING_STEPS.length) {
      // Move to notification setup
      console.log('Moving to notification setup');
      setCurrentStep(ONBOARDING_STEPS.length + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      if (currentStep === ONBOARDING_STEPS.length + 1) {
        // Going back from notification setup to area selection
        setCurrentStep(ONBOARDING_STEPS.length);
      } else if (currentStep === ONBOARDING_STEPS.length) {
        // Going back from area selection to last intro step
        setCurrentStep(ONBOARDING_STEPS.length - 1);
      } else {
        setCurrentStep(currentStep - 1);
      }
    }
  };

  const toggleArea = (areaId: string) => {
    setSelectedAreas(prev => 
      prev.includes(areaId) 
        ? prev.filter(id => id !== areaId)
        : [...prev, areaId]
    );
  };

  const updateTime = (type: 'start' | 'end', change: number) => {
    setNotificationPrefs(prev => {
      const currentTime = type === 'start' ? prev.startTime : prev.endTime;
      const [hours, minutes] = currentTime.split(':').map(Number);
      let newHours = hours + change;
      
      // Handle hour wrapping
      if (newHours < 0) newHours = 23;
      if (newHours > 23) newHours = 0;
      
      const newTime = `${newHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      return {
        ...prev,
        [type === 'start' ? 'startTime' : 'endTime']: newTime
      };
    });
  };

  // Calculate how many notifications per day
  const calculateNotificationsPerDay = () => {
    const [startHour] = notificationPrefs.startTime.split(':').map(Number);
    const [endHour] = notificationPrefs.endTime.split(':').map(Number);
    
    if (endHour > startHour) {
      return endHour - startHour;
    } else {
      return (24 - startHour) + endHour;
    }
  };

  const completeOnboarding = async () => {
    if (isCompleting) {
      console.log('Already completing onboarding, ignoring...');
      return;
    }
    
    setIsCompleting(true);
    
    try {
      console.log('Completing onboarding with selected areas:', selectedAreas);
      console.log('Notification preferences:', notificationPrefs);
      
      // Save onboarding completion and selected areas
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      await AsyncStorage.setItem('selectedAreas', JSON.stringify(selectedAreas));
      
      // Request notification permissions and save preferences
      if (notificationPrefs.enabled) {
        const permissionGranted = await notificationService.requestPermissions();
        if (permissionGranted) {
          await notificationService.saveNotificationPreferences(notificationPrefs);
          console.log('Notifications set up successfully');
        } else {
          console.log('Notification permissions denied');
          // Save preferences anyway but with enabled: false
          await notificationService.saveNotificationPreferences({
            ...notificationPrefs,
            enabled: false
          });
        }
      } else {
        await notificationService.saveNotificationPreferences(notificationPrefs);
      }
      
      console.log('Onboarding data saved, navigating to main app...');
      
      // Navigate to main app
      router.replace('/');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setIsCompleting(false);
      // Still navigate even if there's an error saving
      router.replace('/');
    }
  };

  const renderIntroStep = (step: typeof ONBOARDING_STEPS[0], index: number) => (
    <View style={styles.stepContainer}>
      {/* Back button for steps after the first one */}
      {index > 0 && (
        <TouchableOpacity onPress={handleBack} style={styles.backArrow}>
          <ChevronLeft size={24} color="rgba(255, 255, 255, 0.9)" />
        </TouchableOpacity>
      )}

      <Animated.View entering={FadeInUp.delay(200)} style={styles.stepContent}>
        <Text style={styles.stepTitle}>{step.title}</Text>
        <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
        {step.content ? <Text style={styles.stepDescription}>{step.content}</Text> : null}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400)} style={styles.navigationContainer}>
        <View style={styles.progressDots}>
          {ONBOARDING_STEPS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                i === index && styles.progressDotActive
              ]}
            />
          ))}
        </View>

        <TouchableOpacity 
          onPress={handleNext} 
          style={styles.nextButton}
          activeOpacity={0.7}
        >
          <Text style={styles.nextButtonText}>
            Next
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );

  const renderAreaSelection = () => (
    <View style={styles.stepContainer}>
      {/* Back button */}
      <TouchableOpacity onPress={handleBack} style={styles.backArrow}>
        <ChevronLeft size={24} color="rgba(255, 255, 255, 0.9)" />
      </TouchableOpacity>

      <Animated.View entering={FadeInUp.delay(200)} style={styles.selectionHeader}>
        <Text style={styles.selectionTitle}>Choose Your Focus Areas</Text>
        <Text style={styles.selectionSubtitle}>
          Select the areas where you're ready to stop making excuses
        </Text>
        <Text style={styles.selectionNote}>
          {selectedAreas.length} of {IMPROVEMENT_AREAS.length} selected
        </Text>
      </Animated.View>

      <ScrollView style={styles.areasContainer} showsVerticalScrollIndicator={false}>
        {IMPROVEMENT_AREAS.map((area, index) => {
          const IconComponent = area.icon;
          const isSelected = selectedAreas.includes(area.id);
          
          return (
            <Animated.View
              key={area.id}
              entering={FadeInDown.delay(300 + index * 100)}
            >
              <TouchableOpacity
                onPress={() => toggleArea(area.id)}
                style={[
                  styles.areaCard,
                  isSelected && styles.areaCardSelected
                ]}
                activeOpacity={0.7}
              >
                <View style={styles.areaCardContent}>
                  <View style={[styles.areaIcon, { backgroundColor: area.color + '20' }]}>
                    <IconComponent size={24} color={area.color} />
                  </View>
                  
                  <View style={styles.areaText}>
                    <Text style={styles.areaTitle}>{area.title}</Text>
                    <Text style={styles.areaDescription}>{area.description}</Text>
                  </View>
                  
                  <View style={styles.selectionIndicator}>
                    {isSelected ? (
                      <CheckCircle size={24} color="#34d399" />
                    ) : (
                      <Circle size={24} color="rgba(255, 255, 255, 0.4)" />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </ScrollView>

      <Animated.View entering={FadeInDown.delay(800)} style={styles.selectionFooter}>
        <TouchableOpacity 
          onPress={handleNext}
          style={[
            styles.nextButton,
            selectedAreas.length === 0 && styles.nextButtonDisabled
          ]}
          disabled={selectedAreas.length === 0}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.nextButtonText,
            selectedAreas.length === 0 && styles.nextButtonTextDisabled
          ]}>
            Next
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );

  const renderNotificationSetup = () => (
    <View style={styles.stepContainer}>
      {/* Back button */}
      <TouchableOpacity onPress={handleBack} style={styles.backArrow}>
        <ChevronLeft size={24} color="rgba(255, 255, 255, 0.9)" />
      </TouchableOpacity>

      <Animated.View entering={FadeInUp.delay(200)} style={styles.notificationHeader}>
        <Bell size={48} color="rgba(255, 255, 255, 0.9)" />
        <Text style={styles.notificationTitle}>Get hourly motivation</Text>
        <Text style={styles.notificationSubtitle}>
          Receive 1 affirmation every hour during your chosen time range
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400)} style={styles.notificationContent}>
        {/* Notifications per day info */}
        <View style={styles.notificationInfo}>
          <Text style={styles.notificationInfoText}>
            You'll receive {calculateNotificationsPerDay()} notifications per day
          </Text>
          <Text style={styles.notificationInfoSubtext}>
            One at the top of every hour in your time range
          </Text>
        </View>

        {/* Time range selectors */}
        <View style={styles.timeSettings}>
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>Start at</Text>
            <View style={styles.timeControls}>
              <TouchableOpacity 
                onPress={() => updateTime('start', -1)}
                style={styles.timeButton}
              >
                <Minus size={16} color="rgba(255, 255, 255, 0.7)" />
              </TouchableOpacity>
              <Text style={styles.timeText}>
                {notificationService.formatTime(notificationPrefs.startTime)}
              </Text>
              <TouchableOpacity 
                onPress={() => updateTime('start', 1)}
                style={styles.timeButton}
              >
                <Plus size={16} color="rgba(255, 255, 255, 0.7)" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>End at</Text>
            <View style={styles.timeControls}>
              <TouchableOpacity 
                onPress={() => updateTime('end', -1)}
                style={styles.timeButton}
              >
                <Minus size={16} color="rgba(255, 255, 255, 0.7)" />
              </TouchableOpacity>
              <Text style={styles.timeText}>
                {notificationService.formatTime(notificationPrefs.endTime)}
              </Text>
              <TouchableOpacity 
                onPress={() => updateTime('end', 1)}
                style={styles.timeButton}
              >
                <Plus size={16} color="rgba(255, 255, 255, 0.7)" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(600)} style={styles.notificationFooter}>
        <TouchableOpacity 
          onPress={completeOnboarding}
          style={[styles.nextButton, isCompleting && styles.nextButtonDisabled]}
          disabled={isCompleting}
          activeOpacity={0.7}
        >
          <Text style={[styles.nextButtonText, isCompleting && styles.nextButtonTextDisabled]}>
            {isCompleting ? 'Starting...' : 'Allow and Save'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );

  // Determine what to render based on current step
  const isAreaSelection = currentStep === ONBOARDING_STEPS.length;
  const isNotificationSetup = currentStep === ONBOARDING_STEPS.length + 1;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          {isNotificationSetup 
            ? renderNotificationSetup()
            : isAreaSelection 
            ? renderAreaSelection()
            : renderIntroStep(ONBOARDING_STEPS[currentStep], currentStep)
          }
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  backArrow: {
    position: 'absolute',
    top: 20,
    left: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: 10,
  },
  stepContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  stepTitle: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    marginBottom: 12,
  },
  stepSubtitle: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 24,
  },
  stepDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  navigationContainer: {
    paddingBottom: 40,
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressDotActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  nextButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  nextButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  nextButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  selectionHeader: {
    paddingTop: 80, // Extra padding to account for back button
    paddingBottom: 24,
    alignItems: 'center',
  },
  selectionTitle: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    marginBottom: 8,
  },
  selectionSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 12,
  },
  selectionNote: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  areasContainer: {
    flex: 1,
    marginBottom: 20,
  },
  areaCard: {
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  areaCardSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: '#34d399',
    borderWidth: 2,
  },
  areaCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  areaIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  areaText: {
    flex: 1,
  },
  areaTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 4,
  },
  areaDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  selectionIndicator: {
    marginLeft: 12,
  },
  selectionFooter: {
    paddingBottom: 20,
  },
  // Notification setup styles
  notificationHeader: {
    paddingTop: 80, // Extra padding to account for back button
    paddingBottom: 32,
    alignItems: 'center',
  },
  notificationTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  notificationSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
  },
  notificationContent: {
    flex: 1,
    paddingHorizontal: 8,
  },
  notificationInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  notificationInfoText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 4,
  },
  notificationInfoSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  timeSettings: {
    gap: 12,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  timeLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  timeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'rgba(255, 255, 255, 0.9)',
    minWidth: 80,
    textAlign: 'center',
  },
  notificationFooter: {
    paddingBottom: 20,
  },
});