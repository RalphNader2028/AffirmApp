import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router } from 'expo-router';
import { ChevronLeft, Target, Zap, Clock, Brain, Shield, Trophy, CircleCheck as CheckCircle, Circle } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SwirlingBackground from '@/components/SwirlingBackground';
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
    title: "No more sugar-coated affirmations.",
    subtitle: "Get tough, daily motivation to work hard and stop making excuses!",
    content: ""
  },
  {
    title: "Get Called Out. Get Better.",
    subtitle: "Like a tough older brother in your pocket. We won't let you slack off or feel sorry for yourself.",
    content: ""
  },
  {
    title: "Attack Your Weak Spots.",
    subtitle: "Where are you slacking? Time to face it and fix it.",
    content: ""
  }
];

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [isCompleting, setIsCompleting] = useState(false);

  // Load fonts to prevent text flash
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

  // Don't render content until fonts are loaded
  if (!fontsLoaded && !fontError) {
    return (
      <SwirlingBackground>
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <View style={styles.loadingContainer}>
            {/* Empty loading state - no text to prevent flash */}
          </View>
        </SafeAreaView>
      </SwirlingBackground>
    );
  }

  const handleNext = () => {
    console.log('handleNext called, currentStep:', currentStep);
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === ONBOARDING_STEPS.length - 1) {
      // Move to area selection
      console.log('Moving to area selection');
      setCurrentStep(ONBOARDING_STEPS.length);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      if (currentStep === ONBOARDING_STEPS.length) {
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

  const completeOnboarding = async () => {
    if (isCompleting) {
      console.log('Already completing onboarding, ignoring...');
      return;
    }
    
    setIsCompleting(true);
    
    try {
      console.log('Completing onboarding with selected areas:', selectedAreas);
      
      // Save onboarding completion and selected areas
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      await AsyncStorage.setItem('selectedAreas', JSON.stringify(selectedAreas));
      
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
        <Text style={styles.selectionTitle}>Choose your battles.</Text>
        <Text style={styles.selectionSubtitle}>
          Where are you underperforming? Let's go to work.
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
                      <CheckCircle size={24} color="#FF6F47" />
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
          onPress={completeOnboarding}
          style={[
            styles.nextButton,
            selectedAreas.length === 0 && styles.nextButtonDisabled,
            selectedAreas.length > 0 && styles.nextButtonActive
          ]}
          disabled={selectedAreas.length === 0 || isCompleting}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.nextButtonText,
            (selectedAreas.length === 0 || isCompleting) && styles.nextButtonTextDisabled,
            selectedAreas.length > 0 && styles.nextButtonTextActive
          ]}>
            {isCompleting ? 'Starting...' : 'Get Started'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );

  // Determine what to render based on current step
  const isAreaSelection = currentStep === ONBOARDING_STEPS.length;

  return (
    <SwirlingBackground>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {isAreaSelection 
          ? renderAreaSelection()
          : renderIntroStep(ONBOARDING_STEPS[currentStep], currentStep)
        }
      </SafeAreaView>
    </SwirlingBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  nextButtonActive: {
    backgroundColor: '#FF6F47',
    borderColor: '#FF6F47',
  },
  nextButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  nextButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  nextButtonTextActive: {
    color: 'rgba(255, 255, 255, 0.95)',
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
    borderColor: '#FF6F47',
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
});