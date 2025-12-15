import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import ShineAnim from '../animations/ShineAnim';

const treasureBox = require('../../assets/icons/treasure_box.png');
const shiningEffect = require('../../assets/icons/shining_starts.png');

const TreasureNode = ({ wordCount = 15, onPress, stars = 0 }) => {
    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.8}
        >
            {/* Shining Effect Background */}
            <View style={styles.shineContainer}>
                <ShineAnim duration={4000} style={styles.shineAnim}>
                    <Image
                        source={shiningEffect}
                        style={[styles.shine, { tintColor: '#FFD700' }]}
                        resizeMode="contain"
                    />
                </ShineAnim>
            </View>

            {/* Bubble Container */}
            <View style={styles.bubble}>
                <Image source={treasureBox} style={styles.chest} resizeMode="contain" />
            </View>

            {/* Label */}
            <Text style={styles.label}>{wordCount} Worte</Text>

            {/* Stars */}
            {stars > 0 && (
                <View style={styles.starsContainer}>
                    {[...Array(3)].map((_, i) => (
                        <Text key={i} style={[styles.star, i < stars ? styles.starFilled : styles.starEmpty]}>
                            ★
                        </Text>
                    ))}
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    shineContainer: {
        position: 'absolute',
        width: 140, // Larger than bubble
        height: 140,
        alignItems: 'center',
        justifyContent: 'center',
        top: -20, // Adjust to center behind bubble
    },
    shineAnim: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    shine: {
        width: '100%',
        height: '100%',
        opacity: 0.7,
    },
    bubble: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: 'rgba(255, 255, 255, 0.4)', // Semi-transparent bubble
        borderWidth: 2,
        borderColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    chest: {
        width: 60,
        height: 60,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    starsContainer: {
        flexDirection: 'row',
        marginTop: 4,
        gap: 2,
    },
    star: {
        fontSize: 12,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    starFilled: {
        color: '#FFD700', // Gold
    },
    starEmpty: {
        color: '#E0E0E0', // Light Grey
    },
});

export default TreasureNode;
