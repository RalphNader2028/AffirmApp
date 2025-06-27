import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { Info, Heart, X, CircleCheck as CheckCircle, Circle } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { affirmationsService } from '@/services/affirmationsService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

interface ProgressStats {
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  weeklyGoal: number;
  completedThisWeek: number;
  weeklyCompletions: boolean[];
}

export default function SettingsModalScreen() {
  const [progressStats, setProgressStats] = useState<ProgressStats>({
    currentStreak: 0,
    longestStreak: 0,
    totalDays: 0,
    weeklyGoal: 7,
    completedThisWeek: 0,
    weeklyCompletions: [false, false, false, false, false, false, false],
  });

  // Refresh progress stats when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('Settings screen focused, loading progress stats...');
      loadProgressStats();
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
    <View style={styles.fullScreenContainer}>
      <LinearGradient
        colors={['#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd']}
        style={styles.fullScreenGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}>
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
            {/* Weekly Progress */}
            <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
              <Text style={styles.sectionTitle}>This Week's Goal</Text>
              
              <View style={styles.card}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.1)']}
                  style={styles.cardGradient}>
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
                </LinearGradient>
              </View>
            </Animated.View>

            {/* About Section */}
            <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              
              <View style={styles.card}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.1)']}
                  style={styles.cardGradient}>
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
                </LinearGradient>
              </View>
            </Animated.View>

            {/* Motivational Message */}
            <Animated.View entering={FadeInDown.delay(400)} style={styles.motivationCard}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.15)']}
                style={styles.motivationGradient}>
                <Text style={styles.motivationText}>
                  "Stop making excuses. You know what needs to be done. Get to work! 💪"
                </Text>
              </LinearGradient>
            </Animated.View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
  },
  fullScreenGradient: {
    flex: 1,
  },
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
  },
  cardGradient: {
    padding: 0,
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
    backgroundColor: '#34d399',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#34d399',
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
    backgroundColor: '#34d399',
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
  motivationCard: {
    borderRadius: 16,
    marginBottom: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
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