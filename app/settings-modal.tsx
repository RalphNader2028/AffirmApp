import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { Info, Heart, X, CircleCheck as CheckCircle, Circle, Target, Zap, Clock, Brain, Shield, Trophy, Save } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { affirmationsService } from '@/services/affirmationsService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import SwirlingBackground from '@/components/SwirlingBackground';

interface ProgressStats {
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  weeklyGoal: number;
  completedThisWeek: number;
  weeklyCompletions: boolean[];
}

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

export default function SettingsModalScreen() {
  const [progressStats, setProgressStats] = useState<ProgressStats>({
    currentStreak: 0,
    longestStreak: 0,
    totalDays: 0,
    weeklyGoal: 7,
    completedThisWeek: 0,
    weeklyCompletions: [false, false, false, false, false, false, false],
  });

  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [originalSelectedAreas, setOriginalSelectedAreas] = useState<string[]>([]);
  const [isSavingAreas, setIsSavingAreas] = useState(false);

  // Refresh progress stats when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('Settings screen focused, loading progress stats...');
      loadProgressStats();
      loadSelectedAreas();
    }, [])
  );

  const loadProgressStats = async () => {
    try {
      console.log('Loading progress stats...');
      const stats = await affirmationsService.getProgressStats();
      console.log('Loaded stats:', stats);
      setProgressStats(stats);
    } catch (error) {
      console.error('Error loading progress stats:', error);
    }
  };

  const loadSelectedAreas = async () => {
    try {
      const stored = await AsyncStorage.getItem('selectedAreas');
      if (stored) {
        const areas = JSON.parse(stored);
        setSelectedAreas(areas);
        setOriginalSelectedAreas([...areas]); // Store original state
      }
    } catch (error) {
      console.error('Error loading selected areas:', error);
    }
  };

  const toggleArea = (areaId: string) => {
    setSelectedAreas(prev => 
      prev.includes(areaId) 
        ? prev.filter(id => id !== areaId)
        : [...prev, areaId]
    );
  };

  const saveSelectedAreas = async () => {
    if (isSavingAreas) return;
    
    setIsSavingAreas(true);
    
    try {
      await AsyncStorage.setItem('selectedAreas', JSON.stringify(selectedAreas));
      setOriginalSelectedAreas([...selectedAreas]); // Update original state
      console.log('Selected areas saved:', selectedAreas);
      
      // Show success feedback
      Alert.alert(
        'Preferences Updated',
        'Your affirmation preferences have been saved successfully.',
        [{ text: 'OK', style: 'default' }]
      );
    } catch (error) {
      console.error('Error saving selected areas:', error);
      Alert.alert(
        'Error',
        'Failed to save your preferences. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setIsSavingAreas(false);
    }
  };

  // Check if there are unsaved changes
  const hasUnsavedChanges = () => {
    return JSON.stringify(selectedAreas.sort()) !== JSON.stringify(originalSelectedAreas.sort());
  };

  const closeSettings = () => {
    router.back();
  };

  const progressPercentage = (progressStats.completedThisWeek / progressStats.weeklyGoal) * 100;

  const SettingRow = ({ icon, title, subtitle, rightElement }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    rightElement?: React.ReactNode;
  }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>{icon}</View>
        <View>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement}
    </View>
  );

  return (
    <SwirlingBackground>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={closeSettings} style={styles.closeButton}>
            <X size={24} color="rgba(255, 255, 255, 0.9)" />
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Weekly Progress - Now at the top */}
          <Animated.View entering={FadeInDown.delay(100)} style={styles.section}>
            <Text style={styles.sectionTitle}>This Week's Goal</Text>
            
            <View style={styles.card}>
              <View style={styles.cardGradient}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressTitle}>Weekly Progress</Text>
                  <Text style={styles.progressSubtitle}>
                    {progressStats.completedThisWeek} of {progressStats.weeklyGoal} days
                  </Text>
                </View>
                
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBarBackground}>
                    <Animated.View 
                      style={[styles.progressBarFill, { width: `${Math.min(progressPercentage, 100)}%` }]}
                    />
                  </View>
                  <Text style={styles.progressPercentage}>{Math.round(progressPercentage)}%</Text>
                </View>

                <View style={styles.weeklyDots}>
                  {progressStats.weeklyCompletions.map((completed, index) => (
                    <View
                      key={index}
                      style={[
                        styles.dayDot,
                        completed && styles.dayDotCompleted
                      ]}>
                      {completed ? (
                        <CheckCircle size={20} color="rgba(255, 255, 255, 0.95)" />
                      ) : (
                        <Text style={[
                          styles.dayDotText,
                          completed && styles.dayDotTextCompleted
                        ]}>
                          {['S', 'M', 'T', 'W', 'T', 'F', 'S'][index]}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Choose Your Battle Section */}
          <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
            <Text style={styles.sectionTitle}>Choose Your Battle</Text>
            <Text style={styles.sectionSubtitle}>
              Select the areas where you're ready to stop making excuses
            </Text>
            
            <View style={styles.card}>
              <View style={styles.cardGradient}>
                
                {IMPROVEMENT_AREAS.map((area, index) => {
                  const IconComponent = area.icon;
                  const isSelected = selectedAreas.includes(area.id);
                  
                  return (
                    <TouchableOpacity
                      key={area.id}
                      onPress={() => toggleArea(area.id)}
                      style={[
                        styles.areaRow,
                        index === IMPROVEMENT_AREAS.length - 1 && styles.lastAreaRow
                      ]}
                      activeOpacity={0.7}
                    >
                      <View style={styles.areaLeft}>
                        <View style={[styles.areaIconContainer, { backgroundColor: area.color + '20' }]}>
                          <IconComponent size={20} color={area.color} />
                        </View>
                        <View style={styles.areaTextContainer}>
                          <Text style={styles.areaTitle}>{area.title}</Text>
                          <Text style={styles.areaDescription}>{area.description}</Text>
                        </View>
                      </View>
                      
                      <View style={styles.selectionIndicator}>
                        {isSelected ? (
                          <CheckCircle size={24} color="#FF6F47" />
                        ) : (
                          <Circle size={24} color="rgba(255, 255, 255, 0.4)" />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}

                {/* Save Changes Button - Only show when there are unsaved changes */}
                {hasUnsavedChanges() && (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.saveButtonContainer}>
                      <TouchableOpacity 
                        onPress={saveSelectedAreas}
                        style={[styles.saveButton, isSavingAreas && styles.saveButtonDisabled]}
                        disabled={isSavingAreas}
                        activeOpacity={0.7}
                      >
                        <Save size={20} color="rgba(255, 255, 255, 0.9)" />
                        <Text style={[styles.saveButtonText, isSavingAreas && styles.saveButtonTextDisabled]}>
                          {isSavingAreas ? 'Saving...' : 'Save Changes'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            </View>
          </Animated.View>

          {/* About Section */}
          <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            
            <View style={styles.card}>
              <View style={styles.cardGradient}>
                <SettingRow
                  icon={<Info size={20} color="rgba(255, 255, 255, 0.7)" />}
                  title="App Version"
                  subtitle="1.0.0"
                />
                
                <SettingRow
                  icon={<Heart size={20} color="#f87171" />}
                  title="Made with Love"
                  subtitle="For your daily inspiration"
                />
              </View>
            </View>
          </Animated.View>

          {/* Motivational Message */}
          <Animated.View entering={FadeInDown.delay(400)} style={styles.motivationCard}>
            <View style={styles.motivationGradient}>
              <Text style={styles.motivationText}>
                "Stop making excuses. You know what needs to be done. Get to work! 💪"
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </SwirlingBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: 'rgba(255, 255, 255, 0.95)',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 12,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  cardGradient: {
    padding: 0,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 16,
  },
  progressHeader: {
    padding: 20,
    paddingBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 4,
  },
  progressSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    marginRight: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF6F47',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FF6F47',
  },
  weeklyDots: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  dayDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDotCompleted: {
    backgroundColor: '#FF6F47',
  },
  dayDotText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  dayDotTextCompleted: {
    color: 'rgba(255, 255, 255, 0.95)',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  // Choose Your Battle styles
  areaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  lastAreaRow: {
    borderBottomWidth: 0,
  },
  areaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  areaIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  areaTextContainer: {
    flex: 1,
  },
  areaTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 2,
  },
  areaDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 16,
  },
  selectionIndicator: {
    marginLeft: 12,
  },
  // Save button styles
  saveButtonContainer: {
    padding: 16,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6F47',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: 'rgba(255, 111, 71, 0.5)',
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'rgba(255, 255, 255, 0.95)',
  },
  saveButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  motivationCard: {
    borderRadius: 16,
    marginBottom: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  motivationGradient: {
    padding: 20,
    alignItems: 'center',
  },
  motivationText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    lineHeight: 24,
  },
});