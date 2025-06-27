import { View, Text, StyleSheet, Dimensions, TouchableOpacity, PanResponder, Share as RNShare, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Share, User } from 'lucide-react-native';
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
import SwirlingBackground from '@/components/SwirlingBackground';
import AffirmationCard from '@/components/AffirmationCard';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

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
  const [isReloading, setIsReloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const cardRef = useRef<View>(null);
  const shareCardRef = useRef<View>(null);

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
    if (isReloading) return; // Prevent multiple simultaneous loads
    
    setIsLoading(true);
    setIsReloading(true);
    
    try {
      const allAffirmations = await affirmationsService.getAffirmationsByCategory('all');
      // Shuffle and get 10 affirmations for swiping
      const shuffled = allAffirmations.sort(() => 0.5 - Math.random()).slice(0, 10);
      setAffirmations(shuffled);
      setCurrentIndex(0);
      setCardHistory([]);
    } catch (error) {
      console.error('Error loading affirmations:', error);
    } finally {
      setIsLoading(false);
      setIsReloading(false);
    }
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
      
      // Reload new affirmations after a delay, but don't reset history
      setTimeout(() => {
        loadNewAffirmationsSet();
      }, hasCompletedToday ? 500 : 2500);
    }
  };

  const loadNewAffirmationsSet = async () => {
    if (isReloading) return;
    
    setIsReloading(true);
    
    try {
      const allAffirmations = await affirmationsService.getAffirmationsByCategory('all');
      // Shuffle and get 10 new affirmations
      const shuffled = allAffirmations.sort(() => 0.5 - Math.random()).slice(0, 10);
      
      // Add the new set to existing affirmations instead of replacing
      setAffirmations(prev => [...prev, ...shuffled]);
      
      // Move to the first card of the new set
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      
      console.log('Loaded new affirmation set, moved to index:', newIndex);
    } catch (error) {
      console.error('Error loading new affirmations set:', error);
    } finally {
      setIsReloading(false);
    }
  };

  const previousCard = () => {
    if (cardHistory.length > 0) {
      // Get the last card from history
      const previousCardText = cardHistory[cardHistory.length - 1];
      const newHistory = cardHistory.slice(0, -1);
      
      // Move current card forward in the affirmations array
      const updatedAffirmations = [...affirmations];
      updatedAffirmations.splice(currentIndex, 0, affirmations[currentIndex]);
      
      // Update the current position to show the previous card
      updatedAffirmations[currentIndex] = previousCardText;
      
      setAffirmations(updatedAffirmations);
      setCardHistory(newHistory);
      
      console.log('Moved to previous card, history length:', newHistory.length);
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
    if (isSharing) return;
    
    setIsSharing(true);
    
    try {
      const currentAffirmation = affirmations[currentIndex];
      
      if (Platform.OS === 'web') {
        // For web, create a canvas-based image
        await shareAffirmationWeb(currentAffirmation);
      } else {
        // For mobile, use view-shot to capture the card
        await shareAffirmationMobile(currentAffirmation);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share affirmation. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  const shareAffirmationMobile = async (affirmation: string) => {
    try {
      if (!shareCardRef.current) {
        console.error('Share card ref not available');
        return;
      }

      // Capture the hidden card as an image
      const uri = await captureRef(shareCardRef.current, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      console.log('Captured image URI:', uri);

      // Share the image
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Share Affirmation',
        });
      } else {
        // Fallback to text sharing
        await RNShare.share({
          message: `"${affirmation}" - Lock In`,
          title: 'Daily Affirmation',
        });
      }
    } catch (error) {
      console.error('Error sharing on mobile:', error);
      throw error;
    }
  };

  const shareAffirmationWeb = async (affirmation: string) => {
    try {
      // For web, use the Web Share API if available, otherwise fallback to copying text
      if (navigator.share) {
        await navigator.share({
          title: 'Daily Affirmation - Lock In',
          text: `"${affirmation}" - Lock In`,
        });
      } else {
        // Fallback for web browsers without share API
        await navigator.clipboard.writeText(`"${affirmation}" - Lock In`);
        Alert.alert('Copied!', 'Affirmation copied to clipboard');
      }
    } catch (error) {
      console.error('Error sharing on web:', error);
      throw error;
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
      <SwirlingBackground>
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading your inspiration...</Text>
          </View>
        </SafeAreaView>
      </SwirlingBackground>
    );
  }

  return (
    <SwirlingBackground>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        
        {/* Card Stack Container */}
        <View style={styles.cardStackContainer}>
          {/* Main Card */}
          <Animated.View
            ref={cardRef}
            style={[styles.cardContainer, cardAnimatedStyle]}
            {...panResponder.panHandlers}>

            <View style={styles.glassCard}>
              <View style={styles.glassGradient}>
                
                <View style={styles.affirmationContainer}>
                  <Text style={styles.affirmationText}>
                    {affirmations[currentIndex]}
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
        </View>

        {/* Hidden card for sharing - positioned off-screen */}
        <View style={styles.hiddenCardContainer}>
          <AffirmationCard
            ref={shareCardRef}
            affirmation={affirmations[currentIndex] || ''}
            isForExport={true}
          />
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
          style={[styles.shareButton, isSharing && styles.buttonDisabled]}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          disabled={isSharing}>
          <Share size={24} color={isSharing ? "rgba(255, 255, 255, 0.5)" : "rgba(255, 255, 255, 0.9)"} />
        </TouchableOpacity>

        {/* Settings Button - Positioned at bottom right - Changed to User icon */}
        <TouchableOpacity 
          onPress={openSettings} 
          style={styles.settingsButton}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          disabled={isNavigating}>
          <User 
            size={24} 
            color={isNavigating ? "rgba(255, 255, 255, 0.5)" : "rgba(255, 255, 255, 0.9)"} 
          />
        </TouchableOpacity>
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
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  glassGradient: {
    flex: 1,
    padding: 24,
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
  hiddenCardContainer: {
    position: 'absolute',
    top: -1000, // Position off-screen
    left: -1000,
    opacity: 0,
    pointerEvents: 'none',
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
  buttonDisabled: {
    opacity: 0.6,
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