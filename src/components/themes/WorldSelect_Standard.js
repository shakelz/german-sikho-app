import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image, Alert, ImageBackground, BackHandler, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { getAuth } from '@react-native-firebase/auth';
import { useFocusEffect } from '@react-navigation/native';
import storage from '../../services/storage';
import { useProgress } from '../../context/ProgressContext';
import UserStateService from '../../services/UserStateService';

// --- ASSETS & DATA ---
const homeBg = require('../../assets/icons/home_bg.jpg');
import Header from '../gamified/Header';
import Footer from '../gamified/Footer';
import TutorialOverlay from '../gamified/TutorialOverlay';

const LEVELS_DATA = [
    {
        id: 'A1',
        title: 'Beginner (A1)',
        themes: [
            { id: 'jungle', title: 'Jungle', icon: '🌴', locked: false, colors: ['#4ADE80', '#15803d'] },
            { id: 'vocab_world_1', title: 'Vocab 1', icon: '📖', locked: false, colors: ['#A78BFA', '#7C3AED'], count: '100 Words' },
            { id: 'desert', title: 'Desert', icon: '🌵', locked: false, colors: ['#FDE047', '#CA8A04'] },
            { id: 'vocab_world_2', title: 'Vocab 2', icon: '📘', locked: false, colors: ['#60A5FA', '#1D4ED8'], count: '100 Words' },
            { id: 'snow', title: 'Snow', icon: '❄️', locked: false, colors: ['#E0F2FE', '#0EA5E9'] },
            { id: 'vocab_world_3', title: 'Vocab 3', icon: '📙', locked: false, colors: ['#FDBA74', '#EA580C'], count: '100 Words' },
            { id: 'lava', title: 'Lava', icon: '🌋', locked: false, colors: ['#FCA5A5', '#DC2626'] },
            { id: 'vocab_world_4', title: 'Vocab 4', icon: '📚', locked: false, colors: ['#C084FC', '#7E22CE'], count: '150+ Words' },
        ]
    },
    {
        id: 'A2',
        title: 'Elementary (A2)',
        themes: [
            { id: 'city', title: 'City', icon: '🏙️', locked: true, colors: ['#60A5FA', '#3B82F6'] },
            { id: 'ocean', title: 'Ocean', icon: '🌊', locked: true, colors: ['#60A5FA', '#3B82F6'] },
        ]
    },
];

const WorldSelect_Standard = ({ navigation }) => {
    const [userName, setUserName] = useState('');
    const [profileImage, setProfileImage] = useState(null);
    const [gender, setGender] = useState('male');
    const [masteredCount, setMasteredCount] = useState(0);
    const [showTutorial, setShowTutorial] = useState(false);

    const { updateProgress, coins } = useProgress();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const titleSlideAnim = useRef(new Animated.Value(-50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(titleSlideAnim, {
                toValue: 0,
                tension: 40,
                friction: 8,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadUserData();
            updateProgress();
            loadMasteredCount(true);
            checkTutorialStatus();

            const onBackPress = () => {
                Alert.alert(
                    "Exit App",
                    "Do you want to exit?",
                    [
                        { text: "Cancel", onPress: () => null, style: "cancel" },
                        { text: "YES", onPress: () => BackHandler.exitApp() }
                    ]
                );
                return true;
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, [])
    );

    const checkTutorialStatus = async () => {
        try {
            const hasSeen = await storage.load('has_seen_tutorial');
            if (!hasSeen) {
                setTimeout(() => setShowTutorial(true), 1000);
            }
        } catch (error) {
            console.error('Error checking tutorial status:', error);
        }
    };

    const handleTutorialFinish = async () => {
        setShowTutorial(false);
        await storage.save('has_seen_tutorial', true);
    };

    const loadMasteredCount = async (forceUpdate = false) => {
        if (forceUpdate) {
            UserStateService.isInitialized = false;
        }
        await UserStateService.init();
        const learnedWords = UserStateService.getLearnedWords();
        setMasteredCount(learnedWords.length);
        console.log('📊 Vocab count loaded:', learnedWords.length, 'words');
    };

    const loadUserData = async () => {
        try {
            const user = getAuth().currentUser;
            if (user) {
                const savedName = await storage.load('username');
                setUserName(savedName || user.displayName || 'User');
                const savedImage = await storage.load('profileImage');
                setProfileImage(savedImage);
                const savedGender = await storage.load('gender');
                setGender(savedGender || 'male');
            }
        } catch (error) { console.error(error); }
    };

    const handleCardPress = (theme) => {
        console.log("👆 Tapped:", theme.id);

        if (theme.locked) {
            Alert.alert("Locked", "Complete previous levels first! 🔒");
            return;
        }

        if (theme.id === 'vocab_world_1' || theme.id === 'vocab_world_2' || theme.id === 'vocab_world_3' || theme.id === 'vocab_world_4') {
            navigation.navigate('VocabularyLesson', { category: theme.id });
            return;
        }

        if (theme.id === 'jungle' || theme.id === 'desert' || theme.id === 'snow' || theme.id === 'lava') {
            navigation.navigate('MapScreen', { themeId: theme.id });
        } else {
            Alert.alert("Coming Soon", "Under construction! 🚧");
        }
    };

    const tutorialSteps = [
        {
            title: 'Welcome to GermanSikho! 🇩🇪',
            description: "Your adventure to fluency begins now. Let's take a quick tour of your new world.",
            icon: '👋'
        },
        {
            title: 'Explore Worlds 🌍',
            description: "Travel through the Jungle 🌴, Desert 🌵, and Snow ❄️ to master different Grammar topics.",
            icon: '🗺️'
        },
        {
            title: 'Learn Vocabulary 📘',
            description: "Unlock 'Vocab Worlds' to learn thousands of new words with our smart flashcards.",
            icon: '🧠'
        },
        {
            title: 'Track Progress 📈',
            description: "Tap your avatar 👤 to see your stats, customize your profile, and track your mastery.",
            icon: '🏆'
        }
    ];

    return (
        <ImageBackground source={homeBg} style={styles.container} resizeMode="cover" blurRadius={3}>
            <View style={styles.backgroundOverlay} />

            <Header
                onAvatarPress={() => navigation.navigate('Profile')}
                onSettingsPress={() => navigation.navigate('Settings')}
                onFlashcardsPress={() => navigation.navigate('VocabPlayground')}
            />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View style={[
                    styles.headerContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: titleSlideAnim }]
                    }
                ]}>
                    <Text style={styles.greetingText}>Start Learning,</Text>
                    <Text style={styles.pageTitle}>Explore Worlds</Text>
                </Animated.View>

                {LEVELS_DATA.map((level) => (
                    <View key={level.id} style={styles.levelSection}>

                        <View style={styles.sectionHeader}>
                            <View style={styles.levelBadgeContainer}>
                                <Text style={styles.levelBadgeText}>{level.id}</Text>
                            </View>
                            <Text style={styles.levelTitle}>{level.title.replace(`(${level.id})`, '')}</Text>
                        </View>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.cardsRow}
                            decelerationRate="fast"
                            snapToInterval={186}
                        >
                            {level.themes.map((theme, index) => (
                                <Animated.View
                                    key={theme.id}
                                    style={{
                                        opacity: fadeAnim,
                                        transform: [{
                                            scale: fadeAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [0.9, 1]
                                            })
                                        }]
                                    }}
                                >
                                    <TouchableOpacity
                                        activeOpacity={0.9}
                                        onPress={() => handleCardPress(theme)}
                                        style={[
                                            styles.cardContainer,
                                            theme.locked && styles.cardLocked
                                        ]}
                                    >
                                        <LinearGradient
                                            colors={theme.locked ? ['#F3F4F6', '#E5E7EB'] : theme.colors}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={styles.cardGradient}
                                        >
                                            <View style={styles.cardCircleDecor} />

                                            <View style={styles.cardTop}>
                                                <Text style={theme.locked ? styles.iconLocked : styles.icon}>
                                                    {theme.locked ? '🔒' : theme.icon}
                                                </Text>
                                            </View>

                                            <View style={styles.cardBottom}>
                                                <Text
                                                    style={[styles.cardTitle, theme.locked && styles.textLocked]}
                                                    numberOfLines={1}
                                                >
                                                    {theme.title}
                                                </Text>

                                                <View style={styles.metaRow}>
                                                    {theme.count ? (
                                                        <View style={styles.badgeContainer}>
                                                            <Text style={styles.badgeText}>{theme.count}</Text>
                                                        </View>
                                                    ) : (
                                                        !theme.locked && (
                                                            <View style={styles.playBtn}>
                                                                <Text style={styles.playBtnText}>START</Text>
                                                            </View>
                                                        )
                                                    )}
                                                </View>

                                                {theme.count && (
                                                    <Text style={styles.masteredText}>
                                                        {masteredCount} Mastered
                                                    </Text>
                                                )}
                                            </View>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </Animated.View>
                            ))}
                        </ScrollView>
                    </View>
                ))}
            </ScrollView>

            <Footer onVocabularyPress={() => navigation.navigate('VocabPlayground')} />

            <TutorialOverlay
                visible={showTutorial}
                steps={tutorialSteps}
                onFinish={handleTutorialFinish}
            />

        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
    },
    scrollContent: {
        paddingBottom: 120,
        paddingTop: 140,
    },

    headerContainer: {
        paddingHorizontal: 24,
        marginBottom: 30,
    },
    greetingText: {
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '500',
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    pageTitle: {
        fontSize: 34,
        fontWeight: '800',
        color: '#111827',
        letterSpacing: -1,
    },

    levelSection: {
        marginBottom: 35,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 20,
    },
    levelBadgeContainer: {
        backgroundColor: '#1F2937',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        marginRight: 12,
    },
    levelBadgeText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    levelTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#374151',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    cardsRow: {
        paddingHorizontal: 24,
        paddingBottom: 20,
    },

    cardContainer: {
        width: 170,
        height: 240,
        marginRight: 16,
        borderRadius: 28,
        backgroundColor: 'white',
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
        elevation: 10,
    },
    cardLocked: {
        shadowColor: '#000',
        shadowOpacity: 0.05,
        elevation: 2,
    },
    cardGradient: {
        flex: 1,
        borderRadius: 28,
        padding: 20,
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
    },
    cardCircleDecor: {
        position: 'absolute',
        top: -30,
        right: -30,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },

    cardTop: {
        alignItems: 'flex-start',
        marginTop: 10,
    },
    icon: {
        fontSize: 48,
        textShadowColor: 'rgba(0,0,0,0.1)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 4,
    },
    iconLocked: {
        fontSize: 32,
        opacity: 0.4,
    },
    cardBottom: {
        justifyContent: 'flex-end',
    },
    cardTitle: {
        color: 'white',
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: -0.5,
        marginBottom: 12,
        textShadowColor: 'rgba(0,0,0,0.1)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    textLocked: {
        color: '#9CA3AF',
    },

    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    badgeContainer: {
        backgroundColor: 'rgba(255,255,255,0.25)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '700',
    },
    playBtn: {
        backgroundColor: 'white',
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 20,
    },
    playBtnText: {
        color: '#111827',
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    masteredText: {
        marginTop: 8,
        color: 'rgba(255,255,255,0.8)',
        fontSize: 11,
        fontWeight: '600',
    }
});

export default WorldSelect_Standard;
