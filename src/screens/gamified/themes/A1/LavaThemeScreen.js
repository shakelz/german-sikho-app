import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageBackground, Alert, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Sound from 'react-native-sound';
import TestService from '../../../../services/TestService';

// Background Image (You might want to use a specific lava background if available)
const lavaBg = require('../../../../assets/icons/home_bg.png'); // Fallback to home_bg for now

const LavaThemeScreen = ({ navigation }) => {
    const musicRef = useRef(null);

    // Play background music on mount
    useEffect(() => {
        Sound.setCategory('Playback', true);
        const soundFile = Platform.OS === 'android' ? 'background_music' : 'background_music.mp3';

        const music = new Sound(soundFile, Sound.MAIN_BUNDLE, (error) => {
            if (error) {
                console.log('Failed to load lava sound', error);
                return;
            }
            musicRef.current = music;
            music.setVolume(0.5);
            music.setNumberOfLoops(-1);
            music.play();
        });

        return () => {
            const sound = musicRef.current;
            if (sound) {
                sound.stop(() => sound.release());
            }
            musicRef.current = null;
        };
    }, []);

    const handleModePress = async (mode, title) => {
        try {
            let questions = [];

            // Show loading or prepare data
            if (mode === 'mixed') {
                questions = await TestService.generateMixedBatch(15);
            } else if (mode === 'reading') {
                questions = TestService.generateReadingQuestions(15);
            } else if (mode === 'listening') {
                questions = TestService.generateListeningQuestions(15);
            } else if (mode === 'exam') {
                questions = await TestService.generateFinalExam();
            }

            if (questions.length === 0) {
                Alert.alert("Error", "Could not generate questions. Please try again.");
                return;
            }

            navigation.navigate('Quiz', {
                lessonData: {
                    id: `lava_${mode}`,
                    title: title,
                    quizQuestions: questions,
                    moduleId: 'lava_theme' // For tracking if needed
                },
                themeId: 'lava',
                mode: mode // Pass mode to QuizScreen
            });

        } catch (error) {
            console.error("Error starting quiz:", error);
            Alert.alert("Error", "Something went wrong starting the quiz.");
        }
    };

    return (
        <ImageBackground source={lavaBg} style={styles.container} resizeMode="cover">
            <LinearGradient colors={['rgba(0,0,0,0.7)', 'rgba(239, 68, 68, 0.3)']} style={styles.overlay}>

                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={styles.backText}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>The Final Exam 🌋</Text>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.subtitle}>Prove your mastery to escape the Lava World!</Text>

                    {/* Tile 1: Mixed Practice */}
                    <TouchableOpacity
                        style={styles.tile}
                        activeOpacity={0.8}
                        onPress={() => handleModePress('mixed', 'Mixed Practice')}
                    >
                        <LinearGradient colors={['#FCD34D', '#F59E0B']} style={styles.gradient}>
                            <Text style={styles.icon}>🎲</Text>
                            <View>
                                <Text style={styles.tileTitle}>Mixed Practice</Text>
                                <Text style={styles.tileDesc}>Grammar & Vocab Shuffle</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Tile 2: Reading Room */}
                    <TouchableOpacity
                        style={styles.tile}
                        activeOpacity={0.8}
                        onPress={() => handleModePress('reading', 'Reading Room')}
                    >
                        <LinearGradient colors={['#60A5FA', '#2563EB']} style={styles.gradient}>
                            <Text style={styles.icon}>📖</Text>
                            <View>
                                <Text style={styles.tileTitle}>Reading Room</Text>
                                <Text style={styles.tileDesc}>Translate Sentences</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Tile 3: Listening Lab */}
                    <TouchableOpacity
                        style={styles.tile}
                        activeOpacity={0.8}
                        onPress={() => handleModePress('listening', 'Listening Lab')}
                    >
                        <LinearGradient colors={['#A78BFA', '#7C3AED']} style={styles.gradient}>
                            <Text style={styles.icon}>🎧</Text>
                            <View>
                                <Text style={styles.tileTitle}>Listening Lab</Text>
                                <Text style={styles.tileDesc}>Test your ears</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Tile 4: FINAL EXAM */}
                    <TouchableOpacity
                        style={[styles.tile, styles.examTile]}
                        activeOpacity={0.8}
                        onPress={() => {
                            Alert.alert(
                                "Start Final Exam?",
                                "50 Questions. No feedback until the end. Are you ready?",
                                [
                                    { text: "Not yet", style: "cancel" },
                                    { text: "I'm Ready! 🔥", onPress: () => handleModePress('exam', 'FINAL EXAM') }
                                ]
                            );
                        }}
                    >
                        <LinearGradient colors={['#EF4444', '#B91C1C']} style={styles.gradient}>
                            <Text style={styles.icon}>🏆</Text>
                            <View>
                                <Text style={styles.tileTitle}>FINAL EXAM</Text>
                                <Text style={styles.tileDesc}>The Ultimate Test</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                </ScrollView>
            </LinearGradient>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    overlay: { flex: 1, padding: 20 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 40 },
    backButton: { marginRight: 15, padding: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10 },
    backText: { color: 'white', fontWeight: 'bold' },
    title: { fontSize: 28, fontWeight: 'bold', color: 'white', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 10 },
    subtitle: { color: '#FECACA', fontSize: 16, textAlign: 'center', marginBottom: 30, fontStyle: 'italic' },

    scrollContent: { paddingBottom: 50 },

    tile: {
        height: 100,
        marginBottom: 20,
        borderRadius: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    examTile: {
        height: 120,
        marginTop: 20,
        transform: [{ scale: 1.05 }],
        borderWidth: 2,
        borderColor: '#FCA5A5'
    },
    gradient: {
        flex: 1,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 25,
    },
    icon: { fontSize: 40, marginRight: 20 },
    tileTitle: { fontSize: 22, fontWeight: 'bold', color: 'white' },
    tileDesc: { fontSize: 14, color: 'rgba(255,255,255,0.9)' },
});

export default LavaThemeScreen;
