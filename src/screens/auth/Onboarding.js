import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar
} from 'react-native';
import storage from '../../services/storage';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGetStarted = async (targetScreen) => {
    await storage.save('alreadyLaunched', true);
    navigation.navigate('Auth', { screen: targetScreen });
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <ImageBackground
        source={require('../../../assets/images/welcome_bg.jpg')}
        style={styles.background}
        resizeMode="cover"
      >
        {/* Overlay Gradient (Optional, for better text readability) */}
        <View style={styles.overlay} />

        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>GermanSikho</Text>
            <Text style={styles.subtitle}>Master German the fun way!</Text>
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.8}
              onPress={() => handleGetStarted('Register')}
            >
              <Text style={styles.primaryButtonText}>GET STARTED</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              activeOpacity={0.8}
              onPress={() => handleGetStarted('Login')}
            >
              <Text style={styles.secondaryButtonText}>I ALREADY HAVE AN ACCOUNT</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: width,
    height: height,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)', // Slight dark overlay
  },
  content: {
    padding: 20,
    paddingBottom: 50,
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '45%', // Occupy bottom half
  },
  headerContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#F0F0F0',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonsContainer: {
    width: '100%',
    gap: 15,
  },
  primaryButton: {
    backgroundColor: '#58CC02', // Duolingo Green
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#58CC02',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    borderBottomWidth: 4,
    borderBottomColor: '#46A302', // Darker green for 3D effect
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default WelcomeScreen;