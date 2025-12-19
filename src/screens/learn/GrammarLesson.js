import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Image, ScrollView, StatusBar } from 'react-native';
import Sound from 'react-native-sound';
import { LESSON_CONTENT } from '../../data/lessonContent';

const grammarBg = require('../../assets/icons/forest_background.jpg');
const closeButton = require('../../assets/icons/close_button.png');
const woodStartButton = require('../../assets/icons/wood_start_qiuz_button.png');

const GrammarLesson = ({ navigation, route }) => {
    const { lessonId, backgroundImage, themeId } = route.params || {};
    const content = LESSON_CONTENT[lessonId];
    const woodTapSound = useRef(null);

    // Use passed background or default to forest
    const bgImage = backgroundImage || grammarBg;

    // Initialize and preload sound
    useEffect(() => {
        Sound.setCategory('Playback');
        woodTapSound.current = new Sound('wood_tap.mp3', Sound.MAIN_BUNDLE, (error) => {
            if (error) {
                console.log('❌ Failed to load wood tap sound:', error);
            }
        });

        return () => {
            if (woodTapSound.current) {
                woodTapSound.current.release();
            }
        };
    }, []);

    const playWoodTapSound = () => {
        if (woodTapSound.current) {
            woodTapSound.current.stop(() => {
                woodTapSound.current.setVolume(1.0);
                woodTapSound.current.play();
            });
        }
    };

    const handleClose = () => {
        playWoodTapSound();
        setTimeout(() => {
            navigation.goBack();
        }, 200);
    };

    const handleStartPractice = () => {
        playWoodTapSound();
        setTimeout(() => {
            navigation.navigate('Quiz', {
                lessonData: {
                    ...content,
                    moduleId: lessonId // Ensure moduleId is passed for progress tracking
                },
                themeId: themeId // Pass themeId to Quiz
            });
        }, 200);
    };

    if (!content) {
        return (
            <View style={styles.container}>
                <Text>Lesson not found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar hidden={true} translucent={true} backgroundColor="transparent" />

            <ImageBackground
                source={bgImage}
                style={styles.background}
                resizeMode="cover"
            >
                {/* Close Button */}
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={handleClose}
                    activeOpacity={0.8}
                >
                    <Image source={closeButton} style={styles.closeIcon} resizeMode="contain" />
                </TouchableOpacity>

                {/* Content Area */}
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Title Card */}
                    <View style={styles.titleCard}>
                        <Text style={styles.title}>{content.title}</Text>
                        <Text style={styles.subtitle}>{content.subtitle}</Text>
                    </View>

                    {/* Lesson Content Card */}
                    <View style={styles.contentCard}>
                        <Text style={styles.sectionTitle}>📚 Introduction</Text>
                        <Text style={styles.text}>{content.intro}</Text>

                        {content.sections.map((section, index) => (
                            <View key={index}>
                                <View style={styles.divider} />
                                <Text style={styles.sectionTitle}>{section.title}</Text>
                                <View style={styles.exampleBox}>
                                    {section.content.map((item, idx) => (
                                        <Text key={idx} style={styles.exampleText}>
                                            {item.de} <Text style={styles.translation}>({item.en})</Text>
                                        </Text>
                                    ))}
                                </View>
                            </View>
                        ))}

                        <View style={styles.divider} />

                        <Text style={styles.sectionTitle}>💡 Tips</Text>
                        {content.tips.map((tip, index) => (
                            <Text key={index} style={styles.text}>• {tip}</Text>
                        ))}
                    </View>

                    {/* Start Practice Button */}
                    <TouchableOpacity
                        style={styles.startButton}
                        onPress={handleStartPractice}
                        activeOpacity={0.8}
                    >
                        <Image
                            source={woodStartButton}
                            style={styles.woodButtonImage}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                </ScrollView>
            </ImageBackground>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 100,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeIcon: {
        width: 40,
        height: 40,
    },
    scrollContent: {
        paddingTop: 100,
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    titleCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 20,
        padding: 25,
        marginBottom: 20,
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 20,
        color: '#666',
        fontWeight: '600',
        textAlign: 'center',
    },
    contentCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
        marginTop: 8,
    },
    text: {
        fontSize: 16,
        color: '#555',
        lineHeight: 24,
        marginBottom: 8,
    },
    divider: {
        height: 1,
        backgroundColor: '#ddd',
        marginVertical: 16,
    },
    exampleBox: {
        backgroundColor: 'rgba(88, 204, 2, 0.1)',
        borderLeftWidth: 4,
        borderLeftColor: '#58CC02',
        padding: 15,
        borderRadius: 8,
        marginTop: 8,
    },
    exampleText: {
        fontSize: 18,
        color: '#333',
        marginBottom: 8,
        fontWeight: '600',
    },
    translation: {
        fontSize: 16,
        color: '#666',
        fontWeight: '400',
        fontStyle: 'italic',
    },
    startButton: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    woodButtonImage: {
        width: 250,
        height: 80,
    },
});

export default GrammarLesson;
