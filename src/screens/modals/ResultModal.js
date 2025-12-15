import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import progressService from '../../services/progressService';
import { saveLessonScore } from '../../services/GrammarService';

const ResultModal = ({ route, navigation }) => {
    const { score, total, moduleId, themeId } = route.params || { score: 0, total: 0 };

    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

    const [coinsAwarded, setCoinsAwarded] = useState(0);
    const scaleAnim = useRef(new Animated.Value(0)).current;

    // Save progress when component mounts
    useEffect(() => {
        const saveProgressData = async () => {
            if (moduleId) {
                await progressService.saveQuizScore(moduleId, score, total);

                // Mark module as complete if score is good enough (e.g., >= 70%)
                if (percentage >= 70) {
                    await progressService.markModuleComplete(moduleId);
                    // Also save to GrammarService for stars/completion
                    await saveLessonScore(moduleId, score, total);

                    // Award Coins Logic
                    let reward = 10; // Base reward for passing
                    if (percentage === 100) reward = 20; // Bonus for perfection

                    // Unique reason ID to prevent double dipping for this specific attempt
                    const reasonId = `quiz_${moduleId}_${Date.now()}`;

                    const newBalance = await progressService.awardCoins(reward, reasonId);
                    if (newBalance !== null) {
                        setCoinsAwarded(reward);
                        startAnimation();
                    }
                }
            }
        };

        saveProgressData();
    }, [moduleId, score, total, percentage]);

    const startAnimation = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    const getMessage = () => {
        if (percentage >= 90) return { emoji: '🎉', text: 'Excellent!', color: '#4CAF50' };
        if (percentage >= 70) return { emoji: '👍', text: 'Great Job!', color: '#2196F3' };
        if (percentage >= 50) return { emoji: '👌', text: 'Good Effort!', color: '#FF9800' };
        return { emoji: '💪', text: 'Keep Practicing!', color: '#F44336' };
    };

    const { emoji, text, color } = getMessage();

    return (
        <View style={styles.container}>
            <View style={styles.modal}>
                {/* Result Icon */}
                <Text style={styles.emoji}>{emoji}</Text>

                {/* Message */}
                <Text style={[styles.message, { color }]}>{text}</Text>

                {/* Score */}
                <View style={styles.scoreContainer}>
                    <Text style={styles.scoreText}>{score}</Text>
                    <Text style={styles.scoreDivider}>/</Text>
                    <Text style={styles.totalText}>{total}</Text>
                </View>

                {/* Percentage */}
                <Text style={styles.percentage}>{percentage}%</Text>

                {/* Coin Reward Animation */}
                {coinsAwarded > 0 && (
                    <Animated.View style={[styles.rewardContainer, { transform: [{ scale: scaleAnim }] }]}>
                        <Text style={styles.coinEmoji}>🪙</Text>
                        <Text style={styles.rewardText}>+{coinsAwarded} Coins!</Text>
                    </Animated.View>
                )}

                {/* Progress Ring Visual */}
                <View style={styles.progressRingContainer}>
                    <View style={[styles.progressRing, { borderColor: color }]}>
                        <Text style={styles.progressLabel}>Correct</Text>
                    </View>
                </View>

                {/* Buttons */}
                <View style={styles.buttonsContainer}>
                    <TouchableOpacity
                        style={[styles.button, styles.retryButton]}
                        onPress={() => {
                            navigation.pop(2); // Go back to Lesson screen
                        }}
                    >
                        <Text style={styles.buttonText}>Try Again</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.homeButton]}
                        onPress={() => {
                            if (themeId) {
                                // Reset stack so Back button goes to WorldSelect, not Quiz
                                navigation.reset({
                                    index: 1,
                                    routes: [
                                        { name: 'WorldSelect' },
                                        { name: 'MapScreen', params: { themeId } },
                                    ],
                                });
                            } else {
                                navigation.popToTop(); // Go back to Home
                            }
                        }}
                    >
                        <Text style={styles.buttonText}>Continue</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        backgroundColor: '#fff',
        borderRadius: 20,
        width: '85%',
        padding: 30,
        alignItems: 'center',
    },
    emoji: {
        fontSize: 80,
        marginBottom: 20,
    },
    message: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 30,
    },
    scoreContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 10,
    },
    scoreText: {
        fontSize: 60,
        fontWeight: 'bold',
        color: '#333',
    },
    scoreDivider: {
        fontSize: 40,
        color: '#999',
        marginHorizontal: 5,
    },
    totalText: {
        fontSize: 40,
        color: '#999',
    },
    percentage: {
        fontSize: 24,
        color: '#666',
        marginBottom: 30,
    },
    progressRingContainer: {
        marginBottom: 30,
    },
    progressRing: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f4f8',
    },
    progressLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
    },
    buttonsContainer: {
        width: '100%',
        gap: 15,
    },
    button: {
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    retryButton: {
        backgroundColor: '#007AFF',
    },
    homeButton: {
        backgroundColor: '#4CAF50',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    rewardContainer: {
        alignItems: 'center',
        marginVertical: 15,
        backgroundColor: '#FFF9C4', // Light yellow
        padding: 10,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#FFD700', // Gold
        elevation: 5,
    },
    coinEmoji: {
        fontSize: 40,
    },
    rewardText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#F57F17', // Darker gold/orange
        marginTop: 5,
    },
});

export default ResultModal;
