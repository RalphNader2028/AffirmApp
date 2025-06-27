import React, { forwardRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;
const CARD_HEIGHT = CARD_WIDTH * 1.6; // 16:10 aspect ratio for sharing

interface AffirmationCardProps {
  affirmation: string;
  isForExport?: boolean;
}

const AffirmationCard = forwardRef<View, AffirmationCardProps>(
  ({ affirmation, isForExport = false }, ref) => {
    const cardWidth = isForExport ? 400 : CARD_WIDTH;
    const cardHeight = isForExport ? 640 : CARD_HEIGHT;

    return (
      <View
        ref={ref}
        style={[
          styles.container,
          {
            width: cardWidth,
            height: cardHeight,
          },
        ]}>
        <View style={styles.background}>
          
          {/* Decorative elements */}
          <View style={[styles.decorativeCircle, styles.circle1]} />
          <View style={[styles.decorativeCircle, styles.circle2]} />
          <View style={[styles.decorativeCircle, styles.circle3]} />
          
          {/* Content */}
          <View style={styles.content}>
            <View style={styles.quoteContainer}>
              <Text style={[
                styles.quote,
                isForExport && styles.quoteExport
              ]}>
                "{affirmation}"
              </Text>
            </View>
            
            <View style={styles.brandingContainer}>
              <Text style={[
                styles.branding,
                isForExport && styles.brandingExport
              ]}>
                Lock In
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }
);

AffirmationCard.displayName = 'AffirmationCard';

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  background: {
    flex: 1,
    backgroundColor: '#1AC8FC',
    position: 'relative',
  },
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  circle1: {
    width: 120,
    height: 120,
    top: -30,
    right: -30,
  },
  circle2: {
    width: 80,
    height: 80,
    bottom: 100,
    left: -20,
  },
  circle3: {
    width: 60,
    height: 60,
    top: '40%',
    left: 20,
  },
  content: {
    flex: 1,
    padding: 32,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quoteContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  quote: {
    fontSize: 24,
    fontFamily: 'Poppins-Medium',
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 36,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  quoteExport: {
    fontSize: 28,
    lineHeight: 40,
  },
  brandingContainer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  branding: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  brandingExport: {
    fontSize: 20,
    letterSpacing: 3,
  },
});

export default AffirmationCard;