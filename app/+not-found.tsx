import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotFoundScreen() {
  return (
    <View style={styles.fullScreenContainer}>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <LinearGradient
        colors={['#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd']}
        style={styles.fullScreenGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}>
        <SafeAreaView style={styles.safeArea} edges={[]}>
          <View style={styles.container}>
            <Heart size={64} color="rgba(255, 255, 255, 0.8)" />
            <Text style={styles.title}>Lost Your Way?</Text>
            <Text style={styles.text}>This screen doesn't exist, but your journey does!</Text>
            <Link href="/" style={styles.link}>
              <View style={styles.linkContainer}>
                <Text style={styles.linkText}>Return to Your Affirmations</Text>
              </View>
            </Link>
          </View>
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
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: 'rgba(255, 255, 255, 0.95)',
    marginTop: 16,
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 24,
  },
  link: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  linkContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  linkText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'rgba(255, 255, 255, 0.95)',
  },
});