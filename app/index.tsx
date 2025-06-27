import { View, Text, StyleSheet, Dimensions, TouchableOpacity, PanResponder, Share as RNShare } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Share, Settings } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  runOnJS,
  interpolate,
  Extrapolate,
  withTiming,
  withSequence,
  withDelay
} from 'react-native-reanimated';
import { affirmationsService } from '@/services/affirmationsService';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Platform } from 'react-native';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width - 40;
const CARD_HEIGHT = height * 0.7; // Reduced from 0.75 to move card up

const SWIPE_THRESHOLD = width * 0.25;

export default function TodayScreen() {
  const [affirmations, setAffirmations] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [cardHistory, setCardHistory] = useState<string[]>([]);
  const [showStreakAnimation, setShowStreakAnimation] = useState(false);
  const [hasCompletedToday, setHasCompletedToday] = useState(false);
  const cardRef = useRef<View>(null);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);

  // Streak animation values
  const streakScale = useSharedValue(0);
  const streakOpacity = useSharedValue(0);
  const streakRotate = useSharedValue(0);

  // Reset navigation state when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setIsNavigating(false);
      checkTodayCompletion();
    }, [])
  );

  useEffect(() => {
    loadAffirmations();
    checkTodayCompletion();
  }, []);

  const checkTodayCompletion = async () => {
    try {
      const completed = await affirmationsService.isDayCompleted(new Date());
      console.log('Today completion status:', completed);
      setHasCompletedToday(completed);
    } catch (error) {
      console.error('Error checking today completion:', error);
      setHasCompletedToday(false);
    }
  };

  const loadAffirmations = async () => {
    setIsLoading(true);
    const allAffirmations = await affirmationsService.getAffirmationsByCategory('all');
    // Shuffle and get 10 affirmations for swiping
    const shuffled = allAffirmations.sort(() => 0.5 - Math.random()).slice(0, 10);
    setAffirmations(shuffled);
    setCurrentIndex(0);
    setCardHistory([]);
    setIsLoading(false);
  };

  const triggerStreakAnimation = async () => {
    // Check if user has already completed today
    if (hasCompletedToday) {
      console.log('User has already completed today, not triggering streak animation');
      return;
    }

    console.log('Triggering streak animation...');
    setShowStreakAnimation(true);
    
    // Animate the streak celebration
    streakScale.value = withSequence(
      withTiming(1.2, { duration: 300 }),
      withTiming(1, { duration: 200 })
    );
    
    streakOpacity.value = withSequence(
      withTiming(1, { duration: 300 }),
      withDelay(1500, withTiming(0, { duration: 300 }))
    );
    
    streakRotate.value = withSequence(
      withTiming(10, { duration: 150 }),
      withTiming(-10, { duration: 150 }),
      withTiming(0, { duration: 150 })
    );

    // Mark today as completed and update streak
    await affirmationsService.markTodayCompleted();
    console.log('Today marked as completed');
    setHasCompletedToday(true);

    // Hide animation after delay
    setTimeout(() => {
      setShowStreakAnimation(false);
      streakScale.value = 0;
      streakOpacity.value = 0;
      streakRotate.value = 0;
    }, 2000);
  };

  const nextCard = () => {
    console.log('Moving to next card. Current index:', currentIndex, 'Total cards:', affirmations.length);
    
    if (currentIndex < affirmations.length - 1) {
      // Add current card to history before moving to next
      setCardHistory(prev => [...prev, affirmations[currentIndex]]);
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      
      // Check if this is the 10th card (last card, index 9)
      console.log('New index:', newIndex, 'Is last card?', newIndex === affirmations.length - 1);
      if (newIndex === affirmations.length - 1) {
        console.log('This is the last card, will trigger animation on next swipe');
      }
    } else {
      // This was the last card - trigger animation and reload (only if not completed today)
      console.log('Completed all cards! Has completed today?', hasCompletedToday);
      if (!hasCompletedToday) {
        triggerStreakAnimation();
      } else {
        console.log('Already completed today, just reloading cards');
      }
      // Reload new affirmations after a delay
      setTimeout(() => {
        loadAffirmations();
      }, hasCompletedToday ? 500 : 2500);
    }
  };

  const previousCard = () => {
    if (cardHistory.length > 0) {
      // Move current card back to the end of affirmations array
      const updatedAffirmations = [...affirmations];
      updatedAffirmations.splice(currentIndex + 1, 0, affirmations[currentIndex]);
      
      // Get the last card from history
      const previousCardText = cardHistory[cardHistory.length - 1];
      const newHistory = cardHistory.slice(0, -1);
      
      // Update the current card to be the previous one
      updatedAffirmations[currentIndex] = previousCardText;
      
      setAffirmations(updatedAffirmations);
      setCardHistory(newHistory);
    }
  };

  const resetCard = () => {
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    rotate.value = withSpring(0);
    scale.value = withSpring(1);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt) => {
      // Don't capture touches on the settings button area
      const { pageX, pageY } = evt.nativeEvent;
      const settingsButtonArea = {
        left: width - 90, // Settings button is 50px wide + 20px margin + 20px buffer
        top: height - 120, // Settings button area
        right: width,
        bottom: height
      };
      
      const shareButtonArea = {
        left: 20, // Share button area on the left
        top: height - 120,
        right: 90,
        bottom: height
      };
      
      const isInSettingsArea = pageX >= settingsButtonArea.left && 
                              pageX <= settingsButtonArea.right && 
                              pageY >= settingsButtonArea.top && 
                              pageY <= settingsButtonArea.bottom;
      
      const isInShareArea = pageX >= shareButtonArea.left && 
                           pageX <= shareButtonArea.right && 
                           pageY >= shareButtonArea.top && 
                           pageY <= shareButtonArea.bottom;
      
      return !isInSettingsArea && !isInShareArea;
    },
    onMoveShouldSetPanResponder: (evt) => {
      // Same check for move events
      const { pageX, pageY } = evt.nativeEvent;
      const settingsButtonArea = {
        left: width - 90,
        top: height - 120,
        right: width,
        bottom: height
      };
      
      const shareButtonArea = {
        left: 20,
        top: height - 120,
        right: 90,
        bottom: height
      };
      
      const isInSettingsArea = pageX >= settingsButtonArea.left && 
                              pageX <= settingsButtonArea.right && 
                              pageY >= settingsButtonArea.top && 
                              pageY <= settingsButtonArea.bottom;
      
      const isInShareArea = pageX >= shareButtonArea.left && 
                           pageX <= shareButtonArea.right && 
                           pageY >= shareButtonArea.top && 
                           pageY <= shareButtonArea.bottom;
      
      return !isInSettingsArea && !isInShareArea;
    },
    onPanResponderGrant: () => {
      scale.value = withSpring(1.05);
    },
    onPanResponderMove: (_, gestureState) => {
      const { dx, dy } = gestureState;
      
      // If we're on the first card and trying to swipe left, limit the movement
      if (cardHistory.length === 0 && dx < 0) {
        // Allow slight movement but with resistance
        translateX.value = dx * 0.2;
      } else {
        translateX.value = dx;
      }
      
      translateY.value = dy;
      rotate.value = dx * 0.1;
    },
    onPanResponderRelease: (_, gestureState) => {
      const { dx, dy } = gestureState;
      
      if (Math.abs(dx) > SWIPE_THRESHOLD) {
        if (dx > 0) {
          // Swipe right - go to next card, animate out to the right
          translateX.value = withTiming(width, { duration: 300 }, () => {
            runOnJS(nextCard)();
            // Reset position to come in from the LEFT (opposite direction)
            translateX.value = -width;
            translateX.value = withSpring(0);
            translateY.value = withSpring(0);
            rotate.value = withSpring(0);
            scale.value = withSpring(1);
          });
        } else if (dx < 0 && cardHistory.length > 0) {
          // Swipe left - go to previous card, animate out to the left
          translateX.value = withTiming(-width, { duration: 300 }, () => {
            runOnJS(previousCard)();
            // Reset position to come in from the RIGHT (opposite direction)
            translateX.value = width;
            translateX.value = withSpring(0);
            translateY.value = withSpring(0);
            rotate.value = withSpring(0);
            scale.value = withSpring(1);
          });
        } else {
          // Can't swipe left on first card, snap back
          resetCard();
        }
      } else {
        // Snap back if threshold not met
        resetCard();
      }
    },
  });

  const cardAnimatedStyle = useAnimatedStyle(() => {
    const rotateZ = interpolate(
      rotate.value,
      [-width, 0, width],
      [-30, 0, 30],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      Math.abs(translateX.value),
      [0, SWIPE_THRESHOLD],
      [1, 0.8],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotateZ: `${rotateZ}deg` },
        { scale: scale.value },
      ],
      opacity,
    };
  });

  const streakAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: streakScale.value },
        { rotateZ: `${streakRotate.value}deg` }
      ],
      opacity: streakOpacity.value,
    };
  });

  const shareAffirmation = async () => {
    try {
      const currentAffirmation = affirmations[currentIndex];
      
      if (Platform.OS === 'web') {
        // For web, use the Web Share API if available, otherwise fallback to copying text
        if (navigator.share) {
          await navigator.share({
            title: 'Daily Affirmation',
            text: currentAffirmation,
          });
        } else {
          // Fallback for web browsers without share API
          await navigator.clipboard.writeText(currentAffirmation);
          console.log('Affirmation copied to clipboard');
        }
      } else {
        // For iOS/Android, use React Native's Share module
        await RNShare.share({
          message: currentAffirmation,
          title: 'Daily Affirmation',
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const openSettings = useCallback(() => {
    if (isNavigating) {
      console.log('Navigation already in progress, ignoring tap');
      return;
    }
    
    setIsNavigating(true);
    console.log('Opening settings modal');
    
    try {
      router.push('/settings-modal');
    } catch (error) {
      console.error('Navigation error:', error);
      setIsNavigating(false);
    }
  }, [isNavigating]);

  if (isLoading || affirmations.length === 0) {
    return (
      <View style={styles.fullScreenContainer}>
        <LinearGradient
          colors={['#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd']}
          style={styles.fullScreenGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading your inspiration...</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.fullScreenContainer}>
      <LinearGradient
        colors={['#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd']}
        style={styles.fullScreenGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          
          {/* Card Stack Container */}
          <View style={styles.cardStackContainer}>
            {/* Main Card */}
            <Animated.View
              ref={cardRef}
              style={[styles.cardContainer, cardAnimatedStyle]}
              {...panResponder.panHandlers}>

              <View style={styles.glassCard}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.1)']}
                  style={styles.glassGradient}>
                  
                  <View style={styles.affirmationContainer}>
                    <Text style={styles.affirmationText}>
                      {affirmations[currentIndex]}
                    </Text>
                  </View>

                  <View style={styles.cardFooter}>
                    <Text style={styles.cardCounter}>
                      {currentIndex + 1} of {affirmations.length}
                    </Text>
                  </View>
                </LinearGradient>
              </View>
            </Animated.View>
          </View>

          {/* Streak Animation Overlay */}
          {showStreakAnimation && (
            <Animated.View style={[styles.streakOverlay, streakAnimatedStyle]}>
              <View style={styles.streakContainer}>
                <Text style={styles.streakEmoji}>🔥</Text>
                <Text style={styles.streakText}>STREAK +1</Text>
                <Text style={styles.streakSubtext}>Daily goal completed!</Text>
              </View>
            </Animated.View>
          )}

          {/* Share Button - Positioned at bottom left */}
          <TouchableOpacity 
            onPress={shareAffirmation} 
            style={styles.shareButton}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Share size={24} color="rgba(255, 255, 255, 0.9)" />
          </TouchableOpacity>

          {/* Settings Button - Positioned at bottom right */}
          <TouchableOpacity 
            onPress={openSettings} 
            style={styles.settingsButton}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            disabled={isNavigating}>
            <Settings 
              size={24} 
              color={isNavigating ? "rgba(255, 255, 255, 0.5)" : "rgba(255, 255, 255, 0.9)"} 
            />
          </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  cardStackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    position: 'relative',
  },
  glassCard: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  glassGradient: {
    flex: 1,
    padding: 24,
    backdropFilter: 'blur(20px)',
  },
  affirmationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  affirmationText: {
    fontSize: 24,
    fontFamily: 'Poppins-Medium',
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 36,
    textAlign: 'center',
  },
  cardFooter: {
    alignItems: 'center',
    marginTop: 20,
  },
  cardCounter: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  streakOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 1000,
  },
  streakContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 40,
    paddingVertical: 30,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fbbf24',
    shadowColor: '#fbbf24',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  streakEmoji: {
    fontSize: 60,
    marginBottom: 10,
  },
  streakText: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    color: '#fbbf24',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  streakSubtext: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  shareButton: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  settingsButton: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
    elevation: 1000,
  },
});