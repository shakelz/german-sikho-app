import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Image } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const cloudImage = require('../../assets/icons/cloud_1.png'); // Use a big cloud

const CloudTransition = ({ visible, onAnimationComplete }) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(1.5)).current;

    useEffect(() => {
        if (visible) {
            // Fade In
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(scale, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                // Wait a bit, then callback (to switch phase)
                setTimeout(() => {
                    onAnimationComplete?.();
                    // Fade Out
                    Animated.parallel([
                        Animated.timing(opacity, {
                            toValue: 0,
                            duration: 800,
                            useNativeDriver: true,
                        }),
                        Animated.timing(scale, {
                            toValue: 1.5,
                            duration: 800,
                            useNativeDriver: true,
                        }),
                    ]).start();
                }, 500);
            });
        }
    }, [visible]);

    if (!visible && opacity._value === 0) return null;

    return (
        <Animated.View style={[styles.container, { opacity }]}>
            <View style={styles.overlay} />
            <Animated.Image
                source={cloudImage}
                style={[styles.cloud, { transform: [{ scale }] }]}
                resizeMode="cover"
            />
            <Animated.Image
                source={cloudImage}
                style={[styles.cloudBottom, { transform: [{ scale: scale }] }]}
                resizeMode="cover"
            />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        alignItems: 'center',
        justifyContent: 'center',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#87CEEB', // Sky color background
    },
    cloud: {
        width: SCREEN_WIDTH * 1.5,
        height: SCREEN_WIDTH * 1.5,
        position: 'absolute',
        top: -100,
    },
    cloudBottom: {
        width: SCREEN_WIDTH * 1.5,
        height: SCREEN_WIDTH * 1.5,
        position: 'absolute',
        bottom: -100,
    },
});

export default CloudTransition;
