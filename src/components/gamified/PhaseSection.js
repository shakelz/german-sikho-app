import React, { useRef } from 'react';
import { View, StyleSheet, ImageBackground, Dimensions, ScrollView, TouchableOpacity, Text, Image } from 'react-native';
import LevelNode from './LevelNode';
import TreasureNode from './TreasureNode';
import FloatingAnim from '../animations/FloatingAnim';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Cloud assets
const cloud1 = require('../../assets/icons/cloud_1.png');
const cloud2 = require('../../assets/icons/cloud_2.png');
const cloud3 = require('../../assets/icons/cloud_3.png');

import { PHASES, TILES } from '../../data/learningPathData';

const PhaseSection = ({ phase, onNodePress, completedNodes = [] }) => {
    const scrollViewRef = useRef(null);

    return (
        <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={[styles.scrollContent, phase.mapHeight && { height: phase.mapHeight }]}
            bounces={false}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
        >
            <ImageBackground
                source={phase.backgroundImage}
                style={styles.background}
                resizeMode="cover"
            >
                {/* Decorative Clouds */}
                <FloatingAnim delay={0} duration={5000} distance={15} style={[styles.cloud, { top: '15%', left: '10%' }]}>
                    <Image source={cloud1} style={{ width: 100, height: 60, opacity: 0.8 }} resizeMode="contain" />
                </FloatingAnim>
                <FloatingAnim delay={1000} duration={6000} distance={20} style={[styles.cloud, { top: '35%', right: '5%' }]}>
                    <Image source={cloud2} style={{ width: 120, height: 70, opacity: 0.7 }} resizeMode="contain" />
                </FloatingAnim>
                <FloatingAnim delay={500} duration={5500} distance={10} style={[styles.cloud, { top: '65%', left: '-10%' }]}>
                    <Image source={cloud3} style={{ width: 140, height: 80, opacity: 0.6 }} resizeMode="contain" />
                </FloatingAnim>

                {phase.nodes.map((node) => {
                    // Centering logic
                    let translateX = -70;
                    let translateY = -70;

                    if (node.type === 'treasure') {
                        translateX = -45;
                        translateY = -45;
                    }

                    const anchorStyle = {
                        position: 'absolute',
                        top: node.top,
                        left: node.left,
                        transform: [
                            { translateX: translateX },
                            { translateY: translateY }
                        ],
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: node.zIndex || 1,
                    };

                    const isCompleted = completedNodes.includes(node.id);
                    const tileSource = TILES[node.tile]; // Resolve the tile image

                    return (
                        <View key={node.id} style={anchorStyle}>
                            {/* 1. The Scalable Button */}
                            <View style={{ transform: [{ scale: node.scale }] }}>
                                {node.type === 'level' ? (
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={() => onNodePress(node)}
                                        style={[
                                            styles.levelNodeContainer,
                                            isCompleted && styles.completedNodeContainer
                                        ]}
                                    >
                                        <ImageBackground
                                            source={tileSource}
                                            style={styles.tileImage}
                                            resizeMode="contain"
                                        >
                                            {isCompleted ? (
                                                <Text style={{ fontSize: 40 }}>🏆</Text>
                                            ) : (
                                                <Image source={node.icon} style={styles.iconImage} resizeMode="contain" />
                                            )}
                                        </ImageBackground>
                                        {/* Stars (Always show) */}
                                        <View style={styles.starsContainer}>
                                            {[...Array(3)].map((_, i) => (
                                                <Text key={i} style={[styles.star, i < node.stars ? styles.starFilled : styles.starEmpty]}>
                                                    ★
                                                </Text>
                                            ))}
                                        </View>
                                    </TouchableOpacity>
                                ) : (
                                    <FloatingAnim duration={2500} distance={8}>
                                        <TreasureNode
                                            wordCount={node.wordCount}
                                            onPress={() => onNodePress(node)}
                                            isCompleted={isCompleted}
                                            stars={node.stars || 0}
                                        />
                                    </FloatingAnim>
                                )}
                            </View>

                            {/* 2. The Fixed-Size Label (Floating below) */}
                            {node.title && (
                                <View style={[styles.labelContainer, isCompleted && styles.completedLabel]}>
                                    <Text style={[styles.labelText, isCompleted && { color: 'white' }]}>
                                        {node.title}
                                    </Text>
                                </View>
                            )}
                        </View>
                    );
                })}

                {/* Padding at bottom */}
                <View style={{ height: 100 }} />
            </ImageBackground>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        height: '130%',
        width: '100%',
    },
    background: {
        width: '100%',
        height: '100%',
    },
    cloud: {
        position: 'absolute',
        zIndex: 0, // Behind nodes
    },
    labelContainer: {
        position: 'absolute',
        top: 110, // Pushed further down to be clearly below the tile
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        zIndex: 20,
    },
    completedLabel: {
        backgroundColor: '#22C55E',
    },
    labelText: {
        color: '#333',
        fontWeight: 'bold',
        fontSize: 12,
    },
    // New Styles for Direct Node Implementation
    levelNodeContainer: {
        width: 140,
        height: 140,
        justifyContent: 'center',
        alignItems: 'center',
    },
    completedNodeContainer: {
        // Optional: Add a glow or border for completed state if needed
        // borderRadius: 70,
        // borderWidth: 4,
        // borderColor: '#22C55E',
    },
    tileImage: {
        width: 140,
        height: 140,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconImage: {
        width: 50,
        height: 50,
        marginBottom: 10,
    },
    starsContainer: {
        position: 'absolute',
        bottom: 35,
        flexDirection: 'row',
        gap: 2,
    },
    star: {
        fontSize: 14,
    },
    starFilled: {
        color: '#FFD700', // Gold
    },
    starEmpty: {
        color: '#C0C0C0', // Silver/Grey
    },
});

export default PhaseSection;
