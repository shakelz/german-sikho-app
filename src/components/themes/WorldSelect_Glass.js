import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image, Alert, ImageBackground, BackHandler, Animated, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { getAuth } from '@react-native-firebase/auth';
import { useFocusEffect } from '@react-navigation/native';
import storage from '../../services/storage';
import { useProgress } from '../../context/ProgressContext';
import UserStateService from '../../services/UserStateService';

const homeBg = require('../../assets/icons/home_bg.png');
import Header from '../gamified/Header';
import Footer from '../gamified/Footer';
import TutorialOverlay from '../gamified/TutorialOverlay';

const LEVELS_DATA = [
    {
        id: 'A1',
        title: 'Beginner Basis',
        themes: [
            { id: 'jungle', title: 'Jungle', icon: '🌴', locked: false, colors: ['#4ADE80', '#059669'] },
            { id: 'vocab_world_1', title: 'Core Vocab I', icon: '📖', locked: false, colors: ['#A78BFA', '#6D28D9'], count: '100 Words' },
            { id: 'desert', title: 'Desert', icon: '🌵', locked: false, colors: ['#FDE047', '#A16207'] },
            { id: 'vocab_world_2', title: 'Core Vocab II', icon: '📘', locked: false, colors: ['#60A5FA', '#1E40AF'], count: '100 Words' },
            { id: 'snow', title: 'Snow', icon: '❄️', locked: false, colors: ['#E0F2FE', '#0284C7'] },
            { id: 'vocab_world_3', title: 'Vocab III', icon: '📙', locked: false, colors: ['#FDBA74', '#C2410C'], count: '100 Words' },
            { id: 'lava', title: 'Lava', icon: '🌋', locked: false, colors: ['#FCA5A5', '#B91C1C'] },
            { id: 'vocab_world_4', title: 'Vocab IV', icon: '📚', locked: false, colors: ['#C084FC', '#6B21A8'], count: '150+ Words' },
        ]
    },
    {
        id: 'A2',
        title: 'Elementary Steps',
        themes: [
            { id: 'city', title: 'Metropolis', icon: '🏙️', locked: true, colors: ['#94a3b8', '#475569'] },
            { id: 'ocean', title: 'Deep Ocean', icon: '🌊', locked: true, colors: ['#94a3b8', '#475569'] },
        ]
    },
];

const WorldSelect_Glass = ({ navigation }) => {
    const [userName, setUserName] = useState('');
    const [profileImage, setProfileImage] = useState(null);
    const [gender, setGender] = useState('male');
    const [masteredCount, setMasteredCount] = useState(0);
    const [showTutorial, setShowTutorial] = useState(false);

    const { updateProgress, coins } = useProgress();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const titleSlideAnim = useRef(new Animated.Value(-30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(titleSlideAnim, {
                toValue: 0,
                tension: 20,
                friction: 7,
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
                Alert.alert("Exit App", "Do you want to exit?", [
                    { text: "Cancel", onPress: () => null, style: "cancel" },
                    { text: "YES", onPress: () => BackHandler.exitApp() }
                ]);
                return true;
            };
            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, [])
    );

    const checkTutorialStatus = async () => {
        try {
            const hasSeen = await storage.load('has_seen_tutorial');
            if (!hasSeen) setTimeout(() => setShowTutorial(true), 1000);
        } catch (error) { console.error(error); }
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
        try {
            const user = getAuth().currentUser;
            if (user) {
                const savedName = await storage.load('username');
                setUserName(savedName || user.displayName || 'Traveler');
                const savedImage = await storage.load('profileImage');
                setProfileImage(savedImage);
                const savedGender = await storage.load('gender');
                setGender(savedGender || 'male');
            }
        } catch (error) { console.error(error); }
    };

    const handleCardPress = (theme) => {
        if (theme.locked) {
            Alert.alert("Region Locked", "Master previous worlds to unlock this area. 🔒");
            return;
        }
        if (theme.id.includes('vocab')) {
            navigation.navigate('VocabularyLesson', { category: theme.id });
        } else if (['jungle', 'desert', 'snow', 'lava'].includes(theme.id)) {
            navigation.navigate('MapScreen', { themeId: theme.id });
        } else {
            Alert.alert("Coming Soon", "This world is still forming! 🚧");
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
        <ImageBackground source={homeBg} style={styles.container} resizeMode="cover">
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <LinearGradient
                colors={['rgba(17, 24, 39, 0.8)', 'rgba(17, 24, 39, 0.95)']}
                style={StyleSheet.absoluteFillObject}
            />

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
                    { opacity: fadeAnim, transform: [{ translateY: titleSlideAnim }] }
                ]}>
                    <Text style={styles.greetingText}>Welcome back, {userName}</Text>
                    <Text style={styles.pageTitle}>Choose Your Path</Text>
                </Animated.View>

                {LEVELS_DATA.map((level) => (
                    <View key={level.id} style={styles.levelSection}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionAccentDot} />
                            <Text style={styles.levelTitle}>{level.title}</Text>
                            <Text style={styles.levelIdText}>{level.id}</Text>
                        </View>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.cardsRow}
                            decelerationRate={0.9}
                            snapToInterval={195}
                        >
                            {level.themes.map((theme) => (
                                <Animated.View
                                    key={theme.id}
                                    style={{ opacity: fadeAnim, transform: [{ scale: fadeAnim }] }}
                                >
                                    <TouchableOpacity
                                        activeOpacity={0.85}
                                        onPress={() => handleCardPress(theme)}
                                        style={styles.cardShadowWrapper}
                                    >
                                        <View style={[styles.cardGlassContainer, theme.locked && styles.cardGlassLocked]}>
                                            <LinearGradient
                                                colors={theme.locked
                                                    ? ['rgba(71, 85, 105, 0.3)', 'rgba(30, 41, 59, 0.5)']
                                                    : theme.colors}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 1 }}
                                                style={[styles.cardGradientContent, theme.locked && styles.gradientLocked]}
                                            >
                                                <Image
                                                    source={homeBg}
                                                    style={[StyleSheet.absoluteFillObject, { opacity: 0.05, resizeMode: 'repeat' }]}
                                                />

                                                <View style={styles.cardTop}>
                                                    <Text style={theme.locked ? styles.iconLocked : styles.icon}>
                                                        {theme.locked ? '🔒' : theme.icon}
                                                    </Text>

                                                    {!theme.locked && (
                                                        <View style={[styles.statusDot, { backgroundColor: theme.colors[0] }]} />
                                                    )}
                                                </View>

                                                <View style={styles.cardBottom}>
                                                    <Text style={[styles.cardTitle, theme.locked && styles.textLocked]} numberOfLines={2}>
                                                        {theme.title}
                                                    </Text>

                                                    <View style={styles.metaActionRow}>
                                                        {theme.count ? (
                                                            <View style={styles.statsContainer}>
                                                                <Text style={styles.statsText}>
                                                                    {masteredCount} / {theme.count.split(' ')[0]}
                                                                </Text>
                                                                <View style={styles.miniProgressBar}>
                                                                    <View style={[
                                                                        styles.miniProgressFill,
                                                                        { width: `${Math.min((masteredCount / 100) * 100, 100)}%`, backgroundColor: theme.colors[0] }
                                                                    ]} />
                                                                </View>
                                                            </View>
                                                        ) : (
                                                            !theme.locked && (
                                                                <View style={styles.enterBtn}>
                                                                    <Text style={styles.enterBtnText}>ENTER</Text>
                                                                </View>
                                                            )
                                                        )}
                                                    </View>
                                                </View>
                                            </LinearGradient>
                                        </View>
                                    </TouchableOpacity>
                                </Animated.View>
                            ))}
                        </ScrollView>
                    </View>
                ))}
            </ScrollView>
            <Footer onVocabularyPress={() => navigation.navigate('VocabPlayground')} />
            <TutorialOverlay visible={showTutorial} steps={tutorialSteps} onFinish={handleTutorialFinish} />
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#111827' },
    scrollContent: { paddingBottom: 120, paddingTop: 130 },

    headerContainer: { paddingHorizontal: 28, marginBottom: 40 },
    greetingText: {
        fontSize: 15,
        color: '#9CA3AF',
        fontWeight: '600',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    pageTitle: {
        fontSize: 38,
        fontWeight: '900',
        color: '#F9FAFB',
        letterSpacing: -1.5,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },

    levelSection: { marginBottom: 45 },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 28,
        marginBottom: 24,
    },
    sectionAccentDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#3B82F6',
        marginRight: 12,
    },
    levelTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#E5E7EB',
        letterSpacing: 0.5,
        marginRight: 12,
    },
    levelIdText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#6B7280',
    },
    cardsRow: { paddingHorizontal: 24, paddingBottom: 30 },

    cardShadowWrapper: {
        width: 180,
        height: 250,
        marginRight: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 12,
    },
    cardGlassContainer: {
        flex: 1,
        borderRadius: 32,
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        backgroundColor: '#1F2937',
    },
    cardGlassLocked: {
        borderColor: 'rgba(255, 255, 255, 0.05)',
        backgroundColor: '#111827',
    },
    cardGradientContent: {
        flex: 1,
        padding: 22,
        justifyContent: 'space-between',
        opacity: 0.92,
    },
    gradientLocked: {
        opacity: 0.6,
    },

    cardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    icon: { fontSize: 52 },
    iconLocked: { fontSize: 36, opacity: 0.5 },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
    },

    cardBottom: { justifyContent: 'flex-end' },
    cardTitle: {
        color: 'white',
        fontSize: 24,
        fontWeight: '800',
        letterSpacing: -0.8,
        marginBottom: 16,
        lineHeight: 28,
    },
    textLocked: { color: '#6B7280' },

    metaActionRow: { flexDirection: 'row', alignItems: 'center' },

    statsContainer: { flex: 1 },
    statsText: {
        color: '#D1D5DB',
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 6,
    },
    miniProgressBar: {
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    miniProgressFill: { height: '100%', borderRadius: 2 },

    enterBtn: {
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 24,
        shadowColor: '#FFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    enterBtnText: {
        color: '#111827',
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
});

export default WorldSelect_Glass;
