import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface SwirlingBackgroundProps {
  children?: React.ReactNode;
}

export default function SwirlingBackground({ children }: SwirlingBackgroundProps) {
  // Animation values for different swirl layers
  const rotation1 = useSharedValue(0);
  const rotation2 = useSharedValue(0);
  const rotation3 = useSharedValue(0);
  const scale1 = useSharedValue(1);
  const scale2 = useSharedValue(1);
  const colorTransition = useSharedValue(0);

  useEffect(() => {
    // Start continuous rotations at different speeds
    rotation1.value = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }),
      -1,
      false
    );

    rotation2.value = withRepeat(
      withTiming(-360, { duration: 15000, easing: Easing.linear }),
      -1,
      false
    );

    rotation3.value = withRepeat(
      withTiming(360, { duration: 25000, easing: Easing.linear }),
      -1,
      false
    );

    // Pulsing scale animations
    scale1.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 8000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.8, { duration: 8000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    scale2.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: 6000, easing: Easing.inOut(Easing.sin) }),
        withTiming(1.1, { duration: 6000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    // Color transition animation
    colorTransition.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 10000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 10000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, []);

  // Animated styles for swirl layers
  const swirl1Style = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotation1.value}deg` },
        { scale: scale1.value },
      ],
    };
  });

  const swirl2Style = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotation2.value}deg` },
        { scale: scale2.value },
      ],
    };
  });

  const swirl3Style = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotation3.value}deg` },
        { scale: 1.1 },
      ],
    };
  });

  // Animated gradient colors
  const backgroundStyle = useAnimatedStyle(() => {
    const color1 = interpolate(
      colorTransition.value,
      [0, 1],
      [0, 1]
    );

    return {
      opacity: 1,
    };
  });

  return (
    <View style={styles.container}>
      {/* Base gradient background */}
      <Animated.View style={[styles.baseGradient, backgroundStyle]}>
        <LinearGradient
          colors={['#1AC8FC', '#1AC8FC', '#1AC8FC']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Swirling layers */}
      <Animated.View style={[styles.swirlLayer, swirl1Style]}>
        <LinearGradient
          colors={['rgba(26, 200, 252, 0.3)', 'rgba(26, 200, 252, 0.1)', 'transparent']}
          style={styles.swirlGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      <Animated.View style={[styles.swirlLayer2, swirl2Style]}>
        <LinearGradient
          colors={['transparent', 'rgba(26, 200, 252, 0.2)', 'rgba(26, 200, 252, 0.4)', 'transparent']}
          style={styles.swirlGradient}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </Animated.View>

      <Animated.View style={[styles.swirlLayer3, swirl3Style]}>
        <LinearGradient
          colors={['rgba(26, 200, 252, 0.15)', 'transparent', 'rgba(26, 200, 252, 0.25)']}
          style={styles.swirlGradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>

      {/* Floating orbs */}
      <Animated.View style={[styles.orb1, swirl1Style]}>
        <LinearGradient
          colors={['rgba(26, 200, 252, 0.4)', 'rgba(26, 200, 252, 0.1)']}
          style={styles.orbGradient}
        />
      </Animated.View>

      <Animated.View style={[styles.orb2, swirl2Style]}>
        <LinearGradient
          colors={['rgba(26, 200, 252, 0.3)', 'rgba(26, 200, 252, 0.05)']}
          style={styles.orbGradient}
        />
      </Animated.View>

      <Animated.View style={[styles.orb3, swirl3Style]}>
        <LinearGradient
          colors={['rgba(26, 200, 252, 0.35)', 'rgba(26, 200, 252, 0.08)']}
          style={styles.orbGradient}
        />
      </Animated.View>

      {/* Content overlay */}
      <View style={styles.contentContainer}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  baseGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradient: {
    flex: 1,
  },
  swirlLayer: {
    position: 'absolute',
    top: -height * 0.3,
    left: -width * 0.3,
    width: width * 1.6,
    height: height * 1.6,
  },
  swirlLayer2: {
    position: 'absolute',
    top: -height * 0.2,
    right: -width * 0.4,
    width: width * 1.4,
    height: height * 1.4,
  },
  swirlLayer3: {
    position: 'absolute',
    bottom: -height * 0.3,
    left: -width * 0.2,
    width: width * 1.5,
    height: height * 1.5,
  },
  swirlGradient: {
    flex: 1,
    borderRadius: width * 0.8,
  },
  orb1: {
    position: 'absolute',
    top: height * 0.15,
    right: width * 0.1,
    width: 120,
    height: 120,
  },
  orb2: {
    position: 'absolute',
    bottom: height * 0.2,
    left: width * 0.05,
    width: 80,
    height: 80,
  },
  orb3: {
    position: 'absolute',
    top: height * 0.4,
    left: width * 0.15,
    width: 60,
    height: 60,
  },
  orbGradient: {
    flex: 1,
    borderRadius: 100,
  },
  contentContainer: {
    flex: 1,
    zIndex: 10,
  },
});