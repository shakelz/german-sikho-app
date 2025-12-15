// Simplified Login.js - Google Sign-In Only
import React, { useState, useContext } from 'react';
import {
    View,
    StyleSheet,
    Alert,
    ImageBackground,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
    Text,
    Image
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { signInWithGoogle } from '../../services/AuthService';
import AppwriteProgressService from '../../services/AppwriteProgressService';
import UserStateService from '../../services/UserStateService';
import storage from '../../services/storage';

const { width, height } = Dimensions.get('window');

const Login = ({ navigation }) => {
    const { signIn: contextSignIn } = useContext(AuthContext);
    const [googleLoading, setGoogleLoading] = useState(false);

    const handleGoogleLogin = async () => {
        if (googleLoading) return;
        setGoogleLoading(true);
        try {
            const userCredential = await signInWithGoogle();
            const googleUser = userCredential.user;
            console.log('Google Sign-In success');

            // Sync Progress from Cloud
            if (googleUser && googleUser.uid) {
                try {
                    console.log('☁️ Syncing progress from cloud...');
                    const syncResult = await AppwriteProgressService.syncOnLogin(googleUser.uid);
                    console.log('✅ Sync complete!');

                    // Extract and apply data from synced data
                    if (syncResult && syncResult.data) {
                        const cloudData = syncResult.data;

                        // Extract stats for UserStateService (new flat structure)
                        const stats = {
                            coins: cloudData.coins || 0,
                            lessonProgress: cloudData.lessonProgress || {},
                            learnedWords: cloudData.learnedWords || []
                        };

                        console.log('📊 Extracting stats from cloud:', JSON.stringify(stats, null, 2));
                        await UserStateService.setState(stats);
                        console.log('✅ UserStateService updated with cloud stats');

                        // Restore vocabulary SRS data if exists
                        if (cloudData.vocabularySRS) {
                            console.log('📚 Restoring vocabulary SRS data...');
                            await storage.save('srs_progress_data', cloudData.vocabularySRS);
                            console.log('✅ Vocabulary SRS data restored:', Object.keys(cloudData.vocabularySRS).length, 'words');
                        } else {
                            console.log('⚠️ No vocabulary SRS data in cloud');
                        }
                    } else {
                        console.log('⚠️ No data in sync result, initializing with defaults');
                        await UserStateService.init();
                    }
                } catch (syncError) {
                    console.warn('⚠️ Sync failed, proceeding offline:', syncError.message);
                }

                // Mark that user has logged in before (skip onboarding on next launch)
                await storage.save('alreadyLaunched', true);
            }

            if (contextSignIn) await contextSignIn();
        } catch (error) {
            if (error.code === '12500') {
                Alert.alert('Google Sign-In Error', 'Google Play Services is missing or outdated.');
            } else {
                Alert.alert('Google Sign-In Error', error.message || 'Something went wrong.');
            }
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <ImageBackground
            source={require('../../assets/icons/login_screen_background.png')}
            style={styles.background}
            resizeMode="cover"
        >
            <View style={styles.container}>
                {/* Top section with mascot and branding */}


                {/* Bottom section with sign-in button */}
                <View style={styles.bottomSection}>
                    <Text style={styles.welcomeText}>Welcome! Sign in to continue</Text>

                    {googleLoading ? (
                        <ActivityIndicator size="large" color="#4285F4" style={styles.loader} />
                    ) : (
                        <TouchableOpacity
                            style={styles.googleButtonContainer}
                            onPress={handleGoogleLogin}
                            activeOpacity={0.8}
                        >
                            <ImageBackground
                                source={require('../../assets/icons/signin_with_google_button.png')}
                                style={styles.googleButtonImage}
                                resizeMode="contain"
                            />
                        </TouchableOpacity>
                    )}

                    <Text style={styles.infoText}>
                        By signing in, you agree to our{'\n'}
                        Terms of Service and Privacy Policy
                    </Text>
                </View>
            </View>
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
        flex: 2,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 80,
    },
    title: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#FFF',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 20,
        color: '#FFF',
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    bottomSection: {
        flex: 2,
        justifyContent: 'flex-end',
        paddingHorizontal: 30,
        paddingBottom: 60,
    },
    welcomeText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFF',
        marginBottom: 30,
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    googleButtonContainer: {
        width: width * 0.85,
        height: 70,
        marginBottom: 20,
    },
    googleButtonImage: {
        width: '100%',
        height: '100%',
    },
    loader: {
        marginVertical: 20,
    },
    infoText: {
        fontSize: 12,
        color: '#FFF',
        textAlign: 'center',
        marginTop: 20,
        opacity: 0.8,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
});

export default Login;