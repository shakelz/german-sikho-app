import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Alert, ImageBackground, BackHandler, Animated, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { getAuth } from '@react-native-firebase/auth';
import { useFocusEffect } from '@react-navigation/native';
import storage from '../../services/storage';
import { useProgress } from '../../context/ProgressContext';
import UserStateService from '../../services/UserStateService';

const homeBg = require('../../assets/icons/home_bg.jpg');
import Header from '../gamified/Header';
import Footer from '../gamified/Footer';
import TutorialOverlay from '../gamified/TutorialOverlay';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.55;
const CARD_HEIGHT = CARD_WIDTH * 1.5;

const LEVELS_DATA = [
    {
        id: 'A1',
        title: 'Genesis',
        subtitle: 'The Beginning',
        themes: [
            { id: 'jungle', title: 'Jungle', icon: '🌴', locked: false, colors: ['#22c55e', '#14532d'] },
            { id: 'vocab_world_1', title: 'Lexicon I', icon: '📖', locked: false, colors: ['#8b5cf6', '#4c1d95'], count: '100 Words' },
            { id: 'desert', title: 'Desert', icon: '🌵', locked: false, colors: ['#eab308', '#713f12'] },
            { id: 'vocab_world_2', title: 'Lexicon II', icon: '📘', locked: false, colors: ['#3b82f6', '#1e3a8a'], count: '100 Words' },
            { id: 'snow', title: 'Tundra', icon: '❄️', locked: false, colors: ['#0ea5e9', '#0c4a6e'] },
            { id: 'vocab_world_3', title: 'Lexicon III', icon: '📙', locked: false, colors: ['#f97316', '#7c2d12'], count: '100 Words' },
            { id: 'lava', title: 'Inferno', icon: '🌋', locked: false, colors: ['#ef4444', '#7f1d1d'] },
            { id: 'vocab_world_4', title: 'Lexicon IV', icon: '📚', locked: false, colors: ['#d946ef', '#701a75'], count: '150+ Words' },
        ]
    },
    {
        id: 'A2',
        title: 'Ascension',
        subtitle: 'The Next Step',
        themes: [
            { id: 'city', title: 'Metropolis', icon: '🏙️', locked: true, colors: ['#64748b', '#334155'] },
            { id: 'ocean', title: 'Abyss', icon: '🌊', locked: true, colors: ['#64748b', '#334155'] },
        ]
    },
];

const WorldSelect_Cinematic = ({ navigation }) => {
    const [userName, setUserName] = useState('');
    const [masteredCount, setMasteredCount] = useState(0);
    const [showTutorial, setShowTutorial] = useState(false);
    const { updateProgress } = useProgress();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const titleSlideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
            Animated.spring(titleSlideAnim, { toValue: 0, friction: 9, tension: 20, useNativeDriver: true })
        ]).start();
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadUserData();
            updateProgress();
            loadMasteredCount(true);
            checkTutorialStatus();
            const onBackPress = () => {
                Alert.alert("Exit", "Leave the application?", [
                    { text: "No", style: "cancel" },
                    { text: "Yes", onPress: () => BackHandler.exitApp() }
                ]);
                return true;
            };
            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, [])
    );

    const checkTutorialStatus = async () => {
        const hasSeen = await storage.load('has_seen_tutorial');
        if (!hasSeen) setTimeout(() => setShowTutorial(true), 1500);
    };

    const handleTutorialFinish = async () => {
        setShowTutorial(false);
        await storage.save('has_seen_tutorial', true);
    };

    const loadMasteredCount = async (forceUpdate = false) => {
        if (forceUpdate) UserStateService.isInitialized = false;
        await UserStateService.init();
        const learnedWords = UserStateService.getLearnedWords();
        setMasteredCount(learnedWords.length);
    };

    const loadUserData = async () => {
        const user = getAuth().currentUser;
        if (user) {
            const savedName = await storage.load('username');
            setUserName(savedName || user.displayName || 'Explorer');
        }
    };

    const handleCardPress = (theme) => {
        if (theme.locked) return;
        if (theme.id.includes('vocab')) navigation.navigate('VocabularyLesson', { category: theme.id });
        else if (['jungle', 'desert', 'snow', 'lava'].includes(theme.id)) navigation.navigate('MapScreen', { themeId: theme.id });
        else Alert.alert("Coming Soon", "The world is generating...");
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
        <View style={styles.mainContainer}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <ImageBackground source={homeBg} style={StyleSheet.absoluteFillObject} resizeMode="cover" blurRadius={40}>
                <LinearGradient
                    colors={['#020617', 'rgba(15, 23, 42, 0.85)', '#020617']}
                    locations={[0, 0.5, 1]}
                    style={StyleSheet.absoluteFillObject}
                />
            </ImageBackground>

            <Header
                onAvatarPress={() => navigation.navigate('Profile')}
                onSettingsPress={() => navigation.navigate('Settings')}
                onFlashcardsPress={() => navigation.navigate('VocabPlayground')}
            />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View style={[styles.headerContainer, { opacity: fadeAnim, transform: [{ translateY: titleSlideAnim }] }]}>
                    <Text style={styles.headerSubtitle}>CONTINUE YOUR JOURNEY</Text>
                    <Text style={styles.headerTitle}>Select{"\n"}World</Text>
                    <View style={styles.headerAccentLine} />
                </Animated.View>

                {LEVELS_DATA.map((level) => (
                    <View key={level.id} style={styles.sectionContainer}>
                        <View style={styles.sectionHeader}>
                            <View>
                                <Text style={styles.sectionLabel}>{level.id}</Text>
                                <Text style={styles.sectionTitle}>{level.title}</Text>
                            </View>
                            <Text style={styles.sectionSubtitle}>{level.subtitle}</Text>
                        </View>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.cardScrollContent}
                            snapToInterval={CARD_WIDTH + 24}
                            decelerationRate="fast"
                        >
                            {level.themes.map((theme, index) => (
                                <TouchableOpacity
                                    key={theme.id}
                                    activeOpacity={0.8}
                                    onPress={() => handleCardPress(theme)}
                                    style={[styles.cardWrapper, { width: CARD_WIDTH, height: CARD_HEIGHT }]}
                                >
                                    <View style={[styles.cardContainer, theme.locked && styles.cardContainerLocked]}>

                                        <LinearGradient
                                            colors={theme.locked
                                                ? ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']
                                                : [theme.colors[0], 'rgba(0,0,0,0)']}
                                            style={StyleSheet.absoluteFillObject}
                                        />

                                        <View style={styles.cardInnerBody}>

                                            {!theme.locked && (
                                                <LinearGradient
                                                    colors={[theme.colors[0], 'transparent']}
                                                    style={styles.ambientGlow}
                                                    start={{ x: 0.5, y: 0 }}
                                                    end={{ x: 0.5, y: 0.6 }}
                                                />
                                            )}

                                            <View style={styles.cardContent}>
                                                <View style={[
                                                    styles.iconOrb,
                                                    theme.locked ? styles.iconOrbLocked : { shadowColor: theme.colors[0] }
                                                ]}>
                                                    <View style={[styles.iconOrbInner, { backgroundColor: theme.locked ? '#1e293b' : '#0f172a' }]}>
                                                        <Text style={theme.locked ? styles.iconLocked : styles.icon}>{theme.locked ? '🔒' : theme.icon}</Text>
                                                    </View>
                                                </View>

                                                <View>
                                                    <Text style={[styles.cardTitle, theme.locked && styles.cardTitleLocked]}>
                                                        {theme.title}
                                                    </Text>

                                                    {theme.count ? (
                                                        <Text style={styles.cardStat}>
                                                            {masteredCount} / {theme.count.split(' ')[0]} Learned
                                                        </Text>
                                                    ) : (
                                                        !theme.locked && <Text style={[styles.cardStat, { color: theme.colors[0] }]}>Tap to Enter</Text>
                                                    )}
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                ))}
            </ScrollView>

            <Footer onVocabularyPress={() => navigation.navigate('VocabPlayground')} />
            <TutorialOverlay visible={showTutorial} steps={tutorialSteps} onFinish={handleTutorialFinish} />
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: '#020617' },
    scrollContent: { paddingTop: 130, paddingBottom: 120 },

    headerContainer: { paddingHorizontal: 30, marginBottom: 50 },
    headerSubtitle: {
        color: '#94a3b8',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 2,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    headerTitle: {
        fontSize: 48,
        fontWeight: '300',
        color: '#ffffff',
        lineHeight: 52,
        letterSpacing: -1,
    },
    headerAccentLine: {
        width: 40,
        height: 4,
        backgroundColor: '#3b82f6',
        marginTop: 20,
        borderRadius: 2,
    },

    sectionContainer: { marginBottom: 50 },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingHorizontal: 30,
        marginBottom: 24,
    },
    sectionLabel: {
        color: '#3b82f6',
        fontSize: 14,
        fontWeight: '900',
        marginBottom: 4,
    },
    sectionTitle: {
        fontSize: 24,
        color: 'white',
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    sectionSubtitle: {
        color: '#475569',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 6,
    },

    cardScrollContent: { paddingHorizontal: 30, paddingBottom: 30 },
    cardWrapper: {
        marginRight: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 20,
    },
    cardContainer: {
        flex: 1,
        borderRadius: 30,
        padding: 1.5,
        overflow: 'hidden',
        backgroundColor: 'transparent',
    },
    cardContainerLocked: {
        opacity: 0.6,
    },
    cardInnerBody: {
        flex: 1,
        backgroundColor: '#0f172a',
        borderRadius: 29,
        padding: 24,
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
    },
    ambientGlow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '60%',
        opacity: 0.15,
    },

    iconOrb: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 20,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 10,
    },
    iconOrbInner: {
        flex: 1,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    iconOrbLocked: {
        shadowOpacity: 0,
        elevation: 0,
        backgroundColor: '#1e293b',
    },
    icon: { fontSize: 32 },
    iconLocked: { fontSize: 32, opacity: 0.3 },

    cardContent: {
        flex: 1,
        justifyContent: 'space-between',
    },
    cardTitle: {
        fontSize: 26,
        color: 'white',
        fontWeight: '600',
        letterSpacing: -0.5,
        marginBottom: 8,
        lineHeight: 30,
    },
    cardTitleLocked: {
        color: '#64748b',
    },
    cardStat: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '600',
        letterSpacing: 0.5,
    },
});

export default WorldSelect_Cinematic;
