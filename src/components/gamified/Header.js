import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import FloatingAnim from '../animations/FloatingAnim';
import { useProgress } from '../../context/ProgressContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Assets
const cloudBg = require('../../assets/icons/cloud_1.png');
const avatar = require('../../assets/icons/default_male_profile.png');
const coinIcon = require('../../assets/icons/coins.png');

const BADGES = {
    A1: require('../../assets/icons/A1_badge.png'),
    A2: require('../../assets/icons/A2_badge.png'),
    B1: require('../../assets/icons/B1_badge.png'),
    B2: require('../../assets/icons/B2_badge.png'),
};

const settingsIcon = require('../../assets/icons/setting_image.png');

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const Header = ({ showBack, onBackPress }) => {
    const navigation = useNavigation();
    // 1. Use Context
    const { progressPercent, currentLevel, coins, learnedVocabCount } = useProgress();

    // Circular Progress Constants for BADGE
    const badgeSize = 80; // Increased size for badge container
    const strokeWidth = 5;
    const radius = (badgeSize - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    const progressAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(progressAnimation, {
            toValue: progressPercent,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    }, [progressPercent]);

    const strokeDashoffset = progressAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [circumference, 0],
    });

    return (
        <View style={styles.container}>
            {/* Floating Cloud Background Layer */}
            <FloatingAnim duration={6000} distance={5}>
                <Image
                    source={cloudBg}
                    style={styles.cloudBg}
                    resizeMode="stretch"
                />
            </FloatingAnim>

            {/* Content Layer */}
            <View style={styles.content}>
                {/* Left Side: Back Button OR Avatar + Badge */}
                <View style={styles.leftContainer}>

                    {showBack ? (
                        <TouchableOpacity
                            onPress={onBackPress || (() => navigation.goBack())}
                            style={styles.backButton}
                        >
                            <Text style={styles.backButtonText}>←</Text>
                        </TouchableOpacity>
                    ) : (
                        <>
                            {/* 1. Simple Avatar (No Progress Ring) */}
                            <TouchableOpacity onPress={() => navigation.navigate('Profile')} activeOpacity={0.8}>
                                <View style={styles.avatarContainer}>
                                    <Image source={avatar} style={styles.avatar} resizeMode="cover" />
                                </View>
                            </TouchableOpacity>

                            {/* 2. Badge with Progress Ring */}
                            <View style={styles.badgeWrapper}>
                                <Svg width={badgeSize} height={badgeSize} style={styles.progressSvg}>
                                    {/* Background Circle */}
                                    <Circle
                                        cx={badgeSize / 2}
                                        cy={badgeSize / 2}
                                        r={radius}
                                        stroke="rgba(255, 255, 255, 0.3)"
                                        strokeWidth={strokeWidth}
                                        fill="none"
                                    />
                                    {/* Progress Circle */}
                                    <AnimatedCircle
                                        cx={badgeSize / 2}
                                        cy={badgeSize / 2}
                                        r={radius}
                                        stroke="#58CC02"
                                        strokeWidth={strokeWidth}
                                        fill="none"
                                        strokeDasharray={`${circumference} ${circumference}`}
                                        strokeDashoffset={strokeDashoffset}
                                        strokeLinecap="round"
                                        rotation="-90"
                                        origin={`${badgeSize / 2}, ${badgeSize / 2}`}
                                    />
                                </Svg>

                                <View style={styles.badgeImageContainer}>
                                    <Image
                                        source={BADGES[currentLevel] || BADGES.A1}
                                        style={styles.badgeIcon}
                                        resizeMode="contain"
                                    />
                                </View>
                            </View>
                        </>
                    )}
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>
                    {/* Coins */}
                    <View style={styles.statItem}>
                        <Image source={coinIcon} style={styles.coinIcon} resizeMode="contain" />
                        <Text style={styles.statText}>{coins}</Text>
                    </View>

                    {/* Vocab Learned */}
                    <View style={styles.statItem}>
                        <Text style={{ fontSize: 28, marginBottom: -5 }}>📖</Text>
                        <Text style={[styles.statText, { color: '#007AFF' }]}>{learnedVocabCount || 0}</Text>
                    </View>

                    {/* Settings Icon */}
                    <TouchableOpacity onPress={() => navigation.navigate('Settings')} activeOpacity={0.7} style={styles.settingsButton}>
                        <Image source={settingsIcon} style={styles.settingsIcon} resizeMode="contain" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 160,
        zIndex: 100,
    },
    cloudBg: {
        width: SCREEN_WIDTH,
        height: '100%',
        position: 'absolute',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 50,
        paddingHorizontal: 15,
        justifyContent: 'space-between',
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    // Simplified Avatar Styles
    avatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#FFFFFF',
        backgroundColor: '#87CEEB',
        elevation: 5,
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    // New Badge Wrapper Styles
    badgeWrapper: {
        width: 80, // Matches badgeSize
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 3,
    },
    progressSvg: {
        position: 'absolute',
    },
    badgeImageContainer: {
        width: 55, // Inner size for the image
        height: 55,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeIcon: {
        width: '100%',
        height: '100%',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statItem: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    coinIcon: {
        width: 35,
        height: 35,
        marginBottom: -5,
    },
    statText: {
        fontSize: 16,
        fontWeight: '900',
        color: '#FFC800',
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 1,
    },

    settingsButton: {
        marginLeft: 5,
    },
    settingsIcon: {
        width: 40,
        height: 40,
    },
    backButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    backButtonText: {
        fontSize: 30,
        color: '#fff',
        fontWeight: 'bold',
        marginTop: -4, // Optical alignment
    },
});

export default Header;
