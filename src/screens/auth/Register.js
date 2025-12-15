import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Alert,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Dimensions,
  Image
} from 'react-native';
import { signUp } from '../../services/AuthService';

const { width, height } = Dimensions.get('window');

const Register = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email) => {
    // Stricter email validation regex (requires at least 2 chars for TLD)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleRegister = async () => {
    if (loading) return;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // Create user with Firebase and update profile using AuthService
      await signUp(email, password, name);

      console.log('Sign up success');
      Alert.alert('Success', 'Account created successfully! Please check your email (including spam folder) for the verification link.');

      // Navigate to Login
      navigation.navigate('Auth', { screen: 'Login' });

    } catch (error) {
      let errorMessage = error.message;
      if (error.code === 'auth/email-already-in-use') errorMessage = 'That email address is already in use!';
      if (error.code === 'auth/invalid-email') errorMessage = 'That email address is invalid!';
      if (error.code === 'auth/weak-password') errorMessage = 'Password is too weak!';
      Alert.alert("Error", errorMessage);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/icons/signup_background_final.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            {/* Top section for spacing */}
            <View style={styles.topSection} />

            {/* Bottom section for form */}
            <View style={styles.bottomSection}>
              {/* Username Input */}
              <ImageBackground
                source={require('../../assets/icons/text_input_field.png')}
                style={styles.inputBackground}
                resizeMode="stretch"
              >
                <TextInput
                  placeholder="Username"
                  placeholderTextColor="#8B6F47"
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                />
              </ImageBackground>

              {/* Email Input */}
              <ImageBackground
                source={require('../../assets/icons/text_input_field.png')}
                style={styles.inputBackground}
                resizeMode="stretch"
              >
                <TextInput
                  placeholder="Email"
                  placeholderTextColor="#8B6F47"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.input}
                />
              </ImageBackground>

              {/* Create Password Input */}
              <ImageBackground
                source={require('../../assets/icons/text_input_field.png')}
                style={styles.inputBackground}
                resizeMode="stretch"
              >
                <TextInput
                  placeholder="Create Password"
                  placeholderTextColor="#8B6F47"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  style={styles.input}
                />
              </ImageBackground>

              {/* Confirm Password Input */}
              <ImageBackground
                source={require('../../assets/icons/text_input_field.png')}
                style={styles.inputBackground}
                resizeMode="stretch"
              >
                <TextInput
                  placeholder="Confirm Password"
                  placeholderTextColor="#8B6F47"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  style={styles.input}
                />
              </ImageBackground>

              {/* Signup Button with Login Badge */}
              {loading ? (
                <ActivityIndicator size="large" color="#FF8C42" style={styles.loader} />
              ) : (
                <View style={styles.buttonContainer}>
                  {/* Main Signup Button */}
                  <TouchableOpacity
                    style={styles.signupButton}
                    onPress={handleRegister}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={require('../../assets/icons/main_signup_button.png')}
                      style={styles.buttonImage}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>

                  {/* Login Badge - Top Left Overlay */}
                  <TouchableOpacity
                    style={styles.loginBadge}
                    onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={require('../../assets/icons/login_button_for_signup_page.png')}
                      style={styles.badgeImage}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    minHeight: height,
  },
  topSection: {
    flex: 2, // Increased to push form down
  },
  bottomSection: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  inputBackground: {
    width: width * 0.85,
    height: 55,
    marginBottom: 12,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  input: {
    fontSize: 16,
    color: '#4A3A2A',
    fontWeight: '600',
  },
  loader: {
    marginTop: 20,
  },
  buttonContainer: {
    width: width * 0.85,
    height: 80,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  signupButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonImage: {
    width: '100%',
    height: '100%',
  },
  loginBadge: {
    position: 'absolute',
    top: -15,
    left: 0,
    width: 80,
    height: 40,
    zIndex: 10,
  },
  badgeImage: {
    width: '100%',
    height: '100%',
  },
});

export default Register;