import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { TILES, ICONS } from '../../data/learningPathData';
import ShineAnim from '../animations/ShineAnim';

const fullStar = require('../../assets/icons/full_star.png');
const emptyStar = require('../../assets/icons/empty_star.png');
const shiningEffect = require('../../assets/icons/shining_starts.png');

const LevelNode = ({
    tile = 'tile_1',
    title,
    stars = 0,
    icon = 'book',
    showText = true,
    onPress
}) => {
    const tileImage = TILES[tile];
    const iconImage = ICONS[icon] || ICONS.book;

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.8}
        >
            {/* Shining Effect Background */}
            <View style={styles.shineContainer}>
                <ShineAnim duration={5000} style={styles.shineAnim}>
                    <Image
                        source={shiningEffect}
                        style={[styles.shine, { tintColor: '#FFD700' }]}
                        resizeMode="contain"
                    />
                </ShineAnim>
            </View>

            {/* Tile Background */}
            <Image source={tileImage} style={styles.tile} resizeMode="contain" />

            {/* Content Overlay */}
            <View style={styles.content}>
                {/* Main Icon */}
                <Image source={iconImage} style={styles.icon} resizeMode="contain" />

                {/* Title */}
                {showText && <Text style={styles.title}>{title}</Text>}

                {/* Stars */}
                <View style={styles.starsRow}>
                    {[1, 2, 3].map((i) => (
                        <Image
                            key={i}
                            source={i <= stars ? fullStar : emptyStar}
                            style={styles.star}
                            resizeMode="contain"
                        />
                    ))}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 140,
        height: 140,
        alignItems: 'center',
        justifyContent: 'center',
    },
    shineContainer: {
        position: 'absolute',
        width: 180, // Larger than tile
        height: 180,
        alignItems: 'center',
        justifyContent: 'center',
        // zIndex: -1 removed, relying on JSX order (it's first, so it's behind)
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
        opacity: 0.6,
    },
    tile: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 10, // Adjust based on tile perspective
    },
    icon: {
        width: 65,
        height: 65,
        marginBottom: 5,
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
        textAlign: 'center',
        marginBottom: 5,
    },
    starsRow: {
        flexDirection: 'row',
        gap: 2,
    },
    star: {
        width: 15,
        height: 15,
    },
});

export default LevelNode;
