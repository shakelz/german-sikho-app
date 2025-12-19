import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Switch,
    TouchableOpacity,
    ScrollView,
    Alert,
    ImageBackground,
    Image,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import storage from '../../services/storage';
import progressService from '../../services/progressService';
import UserStateService from '../../services/UserStateService';
import AppwriteProgressService from '../../services/AppwriteProgressService';
import FloatingAnim from '../../components/animations/FloatingAnim';
import { getAuth } from '@react-native-firebase/auth';
import { WORLD_THEMES, THEME_CONFIG, DEFAULT_THEME } from '../../config/worldThemes';

const forestBg = require('../../assets/icons/forest_background.jpg');
const cloud1 = require('../../assets/icons/cloud_2.png');
const cloud2 = require('../../assets/icons/cloud_3.png');

const Settings = ({ navigation }) => {
    const { signOut: contextSignOut } = useContext(AuthContext);
    const [ttsEnabled, setTtsEnabled] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [seeding, setSeeding] = useState(false);
    const [selectedTheme, setSelectedTheme] = useState(DEFAULT_THEME);

    useEffect(() => {
        loadSettings();
        loadTheme();
    }, []);

    const loadSettings = async () => {
        const tts = await storage.load('tts_enabled');
        const sound = await storage.load('sound_enabled');

        if (tts !== null) setTtsEnabled(tts);
        if (sound !== null) setSoundEnabled(sound);
    };

    const loadTheme = async () => {
        const savedTheme = await storage.load('world_theme');
        if (savedTheme && THEME_CONFIG[savedTheme]) {
            setSelectedTheme(savedTheme);
        } else {
            setSelectedTheme(DEFAULT_THEME);
        }
    };

    const handleThemeSelect = async (themeId) => {
        setSelectedTheme(themeId);
        await storage.save('world_theme', themeId);
        // Use setTimeout to ensure Activity is attached before showing alert
        setTimeout(() => {
            try {
                Alert.alert('Theme Updated', `${THEME_CONFIG[themeId].name} theme applied! ✨`);
            } catch (e) {
                console.log('Theme updated:', themeId);
            }
        }, 100);
    };

    const handleTtsToggle = async (value) => {
        setTtsEnabled(value);
        await storage.save('tts_enabled', value);
    };

    const handleSoundToggle = async (value) => {
        setSoundEnabled(value);
        await storage.save('sound_enabled', value);
    };

    // --- UPDATED LOGOUT LOGIC ---
    const handleSignOut = async () => {
        console.log('Settings: SignOut initiated...');
        try {
            // Import AsyncStorage for direct clearing
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;

            // 1. Clear ALL User-Specific Data from AsyncStorage
            console.log('🧹 Clearing user cache...');

            // Log what exists BEFORE clearing
            console.log('📊 BEFORE CLEARING:');
            const allKeys = await AsyncStorage.getAllKeys();
            console.log('All AsyncStorage keys:', allKeys);

            // List of all user-specific keys to remove
            const keysToRemove = [
                // Profile data
                'username',
                'profileImage',
                'gender',
                // Settings
                'tts_enabled',
                'sound_enabled',
                // AppwriteProgressService cache
                'user_progress',
                // UserStateService cache
                'user_state',
                // GrammarService cache
                'grammar_progress',
                // VocabService cache (both possible key names)
                'vocab_cache',
                'vocabulary_cache',
                'srs_data',
                'srs_progress_data',
            ];

            // Use multiRemove for batch deletion (more reliable)
            await AsyncStorage.multiRemove(keysToRemove);
            console.log('✅ AsyncStorage keys removed:', keysToRemove);

            // Log what exists AFTER clearing
            console.log('📊 AFTER CLEARING:');
            const remainingKeys = await AsyncStorage.getAllKeys();
            console.log('Remaining AsyncStorage keys:', remainingKeys);
            for (const key of keysToRemove) {
                const value = await AsyncStorage.getItem(key);
                if (value) {
                    console.log(`⚠️ ${key} STILL EXISTS!`);
                } else {
                    console.log(`✅ ${key}: cleared`);
                }
            }

            // Reset progress service data
            try {
                await progressService.resetProgress();
                console.log('✅ Progress service reset complete');
            } catch (progressError) {
                console.error('⚠️ Progress service reset failed:', progressError);
            }

            // Clear UserStateService in-memory state
            try {
                await UserStateService.clearState();
                console.log('✅ UserStateService in-memory state cleared');
            } catch (err) {
                console.error('⚠️ UserStateService clear failed:', err);
            }

            // Clear AppwriteProgressService cache
            try {
                await AppwriteProgressService.clearProgress();
                console.log('✅ AppwriteProgressService cache cleared');
            } catch (err) {
                console.error('⚠️ AppwriteProgressService clear failed:', err);
            }

            // NOTE: We keep 'alreadyLaunched' and 'asset_version' as they are not user-specific

            console.log('✅ User cache cleared successfully (Both AsyncStorage & In-Memory)');

            // 2. Call AuthContext signOut
            await contextSignOut();

        } catch (error) {
            console.error('Settings: SignOut error:', error);
            // Even if it fails, try to sign out via context
            await contextSignOut();
        }
    };

    const handleResetProgress = async () => {
        try {
            console.log('🔄 Resetting all progress...');

            // Clear all progress data
            await progressService.resetProgress();
            await UserStateService.clearState();
            await AppwriteProgressService.clearProgress();

            // Sync empty state to cloud
            const user = getAuth().currentUser;
            if (user) {
                await AppwriteProgressService.saveProgress(user.uid, {
                    coins: 0,
                    lessonProgress: {},
                    learnedWords: [],
                    completedModules: [],
                    totalScore: 0,
                    level: 1,
                    achievements: [],
                    vocabularySRS: {}
                });
                console.log('✅ Empty state synced to cloud');
            }

            navigation.navigate('WorldSelect');
            Alert.alert('Success', 'All progress has been reset. Starting fresh! 🌱');
        } catch (error) {
            console.error('Error resetting progress:', error);
            Alert.alert('Error', 'Failed to reset progress.');
        }
    };

    const handleSeedDatabase = async () => {
        Alert.alert(
            'Seed Database',
            'This will populate the database with initial content. It may take a few seconds.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Start',
                    onPress: async () => {
                        try {
                            setSeeding(true);
                            const stats = await seedService.seedDatabase();
                            Alert.alert(
                                'Success',
                                `Database populated!\nModules: ${stats.modules}\nVocab: ${stats.vocab}\nQuestions: ${stats.questions}`
                            );
                        } catch (error) {
                            Alert.alert('Error', 'Failed to seed database. Check console for details.');
                        } finally {
                            setSeeding(false);
                        }
                    }
                }
            ]
        );
    };



    return (
        <ImageBackground source={forestBg} style={styles.container} resizeMode="cover">
            {/* Decorative Clouds */}
            <FloatingAnim delay={0} duration={5000} distance={10} style={[styles.cloud, { top: '10%', left: '5%' }]}>
                <Image source={cloud1} style={{ width: 80, height: 50, opacity: 0.6 }} resizeMode="contain" />
            </FloatingAnim>
            <FloatingAnim delay={2000} duration={6000} distance={15} style={[styles.cloud, { bottom: '15%', right: '10%' }]}>
                <Image source={cloud2} style={{ width: 100, height: 60, opacity: 0.5 }} resizeMode="contain" />
            </FloatingAnim>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={styles.backButtonText}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>⚙️ Settings</Text>
                    <View style={{ width: 60 }} />
                </View>

                {/* Account Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>👤 Account</Text>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.dangerButton]}
                        onPress={handleSignOut}
                    >
                        <Text style={[styles.actionButtonText, styles.dangerText]}>🚪 Sign Out</Text>
                        <Text style={[styles.actionButtonArrow, styles.dangerText]}>›</Text>
                    </TouchableOpacity>
                </View>

                {/* Appearance Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🎨 Appearance</Text>
                    <Text style={styles.settingDesc}>Select your preferred World Select screen theme</Text>

                    {/* Theme Selection Cards */}
                    <View style={styles.themeGrid}>
                        {Object.keys(WORLD_THEMES).map((key) => {
                            const themeId = WORLD_THEMES[key];
                            const theme = THEME_CONFIG[themeId];
                            const isSelected = selectedTheme === themeId;

                            return (
                                <TouchableOpacity
                                    key={themeId}
                                    style={[styles.themeCard, isSelected && styles.themeCardSelected]}
                                    onPress={() => handleThemeSelect(themeId)}
                                >
                                    {isSelected && (
                                        <View style={styles.selectedBadge}>
                                            <Text style={styles.selectedBadgeText}>✓</Text>
                                        </View>
                                    )}
                                    <Text style={styles.themeCardTitle}>{theme.name}</Text>
                                    <Text style={styles.themeCardDesc}>{theme.description}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* App Info Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ℹ️ About</Text>
                    <View style={styles.infoBox}>
                        <Text style={styles.infoText}>🇩🇪 GermanSikho - Learn German Easily</Text>
                        <Text style={styles.infoText}>Version 1.0.0</Text>
                        <Text style={[styles.infoText, { fontSize: 12, color: '#888', marginTop: 8 }]}>
                            Interactive lessons • Smart flashcards • Progress tracking
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 30,
    },
    cloud: {
        position: 'absolute',
        zIndex: 0,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        marginBottom: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    backButton: {
        width: 60,
    },
    backButtonText: {
        fontSize: 16,
        color: '#58CC02',
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        textShadowColor: 'rgba(0,0,0,0.1)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    section: {
        marginTop: 10,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 15,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    settingCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: 15,
        borderRadius: 15,
        marginBottom: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    settingInfo: {
        flex: 1,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginBottom: 5,
    },
    settingDesc: {
        fontSize: 13,
        color: '#666',
    },
    actionButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: 15,
        borderRadius: 15,
        marginBottom: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
    },
    actionButtonArrow: {
        fontSize: 24,
        color: '#ccc',
    },
    dangerButton: {
        borderWidth: 2,
        borderColor: '#FF6347',
    },
    dangerText: {
        color: '#FF6347',
    },
    infoBox: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: 15,
        borderRadius: 15,
        alignItems: 'center',
        elevation: 2,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
        fontWeight: '600',
    },
    // Theme Selection Styles
    themeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 12,
    },
    themeCard: {
        flex: 1,
        minWidth: '47%',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        position: 'relative',
    },
    themeCardSelected: {
        borderColor: '#3B82F6',
        backgroundColor: '#DBEAFE',
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    selectedBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#3B82F6',
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedBadgeText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    themeCardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    themeCardDesc: {
        fontSize: 12,
        color: '#6B7280',
        lineHeight: 18,
    },
});

export default Settings;