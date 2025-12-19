import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, StatusBar, TouchableOpacity, Text, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Sound from 'react-native-sound';

// ✅ Correct Imports
import PhaseSection from '../../../../components/gamified/PhaseSection';
import Header from '../../../../components/gamified/Header';
import CloudTransition from '../../../../components/animations/CloudTransition';
import progressService from '../../../../services/progressService';
import Footer from '../../../../components/gamified/Footer';
import { getLessonProgress, isTileComplete, getTileStars, calculateStars } from '../../../../services/GrammarService';

const DesertThemeScreen = ({ navigation }) => {
    console.log('🌵 DesertThemeScreen: Mounted');

    const [isTransitioning, setIsTransitioning] = useState(false);
    const [completedNodes, setCompletedNodes] = useState([]);
    const musicRef = useRef(null);

    // Define Stage 2 Data with ORIGINAL LAYOUT + NEW LESSONS
    const desertStage2 = {
        id: 'desert_stage_2',
        theme: 'desert',
        title: 'Stage 2: The Desert',
        backgroundImage: require('../../../../assets/icons/desert_background.jpg'),
        nodes: [
            // 1. The Cases (Replaces Akkusativ position)
            {
                id: 'nom_acc',
                title: 'The Cases ⚖️',
                type: 'level',
                tile: 'tile_3', // Random Tile
                icon: require('../../../../assets/icons/book.png'),
                stars: 0,
                top: '90%', left: '25%',
                scale: 0.7,
                zIndex: 10
            },
            // 2. Treasure Chest 1 (Restored)
            {
                id: 't3',
                title: '20 Words',
                type: 'treasure',
                wordCount: 20,
                top: '80%', left: '50%',
                scale: 0.8,
                zIndex: 9
            },
            // 3. Negation (Same position)
            {
                id: 'negation',
                title: 'Negation ⛔',
                type: 'level',
                tile: 'tile_5', // Random Tile
                icon: require('../../../../assets/icons/book.png'),
                stars: 0,
                top: '73%', left: '63%',
                scale: 0.60,
                zIndex: 8
            },
            // 4. Possession (Replaces Possessive Pronouns position)
            {
                id: 'possessive',
                title: 'Possession 🎁',
                type: 'level',
                tile: 'tile_2', // Random Tile
                icon: require('../../../../assets/icons/book.png'),
                stars: 0,
                top: '65%', left: '25%',
                scale: 0.55,
                zIndex: 7
            },
            // 5. Treasure Chest 2 (Restored)
            {
                id: 't4',
                title: '25 Words',
                type: 'treasure',
                wordCount: 25,
                top: '65%', left: '90%',
                scale: 0.6,
                zIndex: 6
            },
            // 6. Modal Verbs (Same position)
            {
                id: 'modal_verbs',
                title: 'Modal Verbs 💪',
                type: 'level',
                tile: 'tile_4', // Random Tile
                icon: require('../../../../assets/icons/book.png'),
                stars: 0,
                top: '60%', left: '50%',
                scale: 0.50,
                zIndex: 5
            },
            // 7. Questions (Replaces W-Questions position)
            {
                id: 'w_questions',
                title: 'Questions ❓',
                type: 'level',
                tile: 'tile_1', // Random Tile
                icon: require('../../../../assets/icons/book.png'),
                stars: 0,
                top: '54%', left: '70%',
                scale: 0.40,
                zIndex: 4
            }
        ]
    };

    useFocusEffect(
        useCallback(() => {
            // 1. Load Progress
            const loadProgress = async () => {
                // 1. Get Grammar Progress (for Tiles)
                const grammarProgress = await getLessonProgress();
                const completedTileIds = [];

                // 2. Get General Progress (for Chests/Modules)
                const progress = await progressService.getProgress();
                let completedModuleIds = [];
                if (progress && progress.completedModules) {
                    completedModuleIds = progress.completedModules;
                }

                // Check each node in the current phase
                desertStage2.nodes.forEach(node => {
                    if (node.type === 'level') {
                        if (isTileComplete(node.id, grammarProgress)) {
                            completedTileIds.push(node.id);
                        }
                        // Update stars
                        node.stars = getTileStars(node.id, grammarProgress);
                    } else if (node.type === 'treasure') {
                        // Check if treasure is completed (module ID matches node ID)
                        // And calculate stars from quizScores if available
                        if (progress && progress.quizScores && progress.quizScores[node.id]) {
                            const scoreData = progress.quizScores[node.id];
                            node.stars = calculateStars(scoreData.score, scoreData.total);
                        }
                    }
                });

                // 3. Merge and Set
                setCompletedNodes([...new Set([...completedTileIds, ...completedModuleIds])]);
            };
            loadProgress();

            // Play Desert Background Music
            Sound.setCategory('Playback', true);
            const soundFile = Platform.OS === 'android' ? 'background_music' : 'background_music.mp3';

            const music = new Sound(soundFile, Sound.MAIN_BUNDLE, (error) => {
                if (error) {
                    console.log('Failed to load desert sound', error);
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
        }, [])
    );

    const handleNodePress = (node) => {
        if (node.type === 'treasure') {
            // Navigate to Vocabulary Chest
            navigation.navigate('VocabularyLesson', {
                lessonId: node.id,
                backgroundImage: require('../../../../assets/icons/desert_background.jpg'),
                themeId: 'desert'
            });
        } else {
            // Navigate to Grammar Lesson
            navigation.navigate('GrammarListScreen', {
                tileId: node.id,
                title: node.title,
                themeId: 'desert' // Pass themeId for navigation
            });
        }
    };

    const handleNextPhase = () => {
        setIsTransitioning(true);
    };

    const handleTransitionComplete = () => {
        setIsTransitioning(false);
        navigation.replace('MapScreen', { themeId: 'snow' });
    };

    return (
        <View style={styles.container}>
            <StatusBar hidden={true} translucent={true} backgroundColor="transparent" />
            <Header showBack={false} />

            <CloudTransition
                visible={isTransitioning}
                onAnimationComplete={handleTransitionComplete}
            />

            <View style={styles.mapContainer}>
                <PhaseSection
                    phase={desertStage2}
                    onNodePress={handleNodePress}
                    completedNodes={completedNodes}
                />
            </View>

            <Footer onVocabularyPress={() => navigation.navigate('VocabPlayground')} />

            {/* Next Button Removed as per request */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FDE047' }, // Desert Yellow
    mapContainer: { flex: 1 },
    footerOverlay: { position: 'absolute', bottom: 100, left: 0, right: 0, alignItems: 'center', zIndex: 100 },
    nextButton: { backgroundColor: '#FFFFFF', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 30, borderWidth: 3, borderColor: '#EAB308', elevation: 5 },
    nextButtonText: { fontSize: 18, fontWeight: 'bold', color: '#CA8A04' },
});

export default DesertThemeScreen;
