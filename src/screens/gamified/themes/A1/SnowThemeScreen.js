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
import { getLessonProgress, isTileComplete, getTileStars } from '../../../../services/GrammarService';

const SnowThemeScreen = ({ navigation }) => {
    console.log('❄️ SnowThemeScreen: Mounted');

    const [isTransitioning, setIsTransitioning] = useState(false);
    const [completedNodes, setCompletedNodes] = useState([]);
    const musicRef = useRef(null);

    // Define Stage 3 Data
    const snowStage3 = {
        id: 'snow_stage_3',
        theme: 'snow',
        title: 'Stage 3: The Snow',
        backgroundImage: require('../../../../assets/icons/snow_background.png'),
        nodes: [
            // 1. Time & Date
            {
                id: 'time_date',
                title: 'Time & Date 🕰️',
                type: 'level',
                tile: 'tile_1',
                icon: require('../../../../assets/icons/book.png'),
                stars: 0,
                top: '90%', left: '20%',
                scale: 0.8,
                zIndex: 10
            },
            // 2. Adjectives
            {
                id: 'adjectives',
                title: 'Adjectives 🎨',
                type: 'level',
                tile: 'tile_2',
                icon: require('../../../../assets/icons/book.png'),
                stars: 0,
                top: '80%', left: '60%',
                scale: 0.75,
                zIndex: 9
            },
            // 3. Prepositions
            {
                id: 'prepositions_acc',
                title: 'Prepositions 📍',
                type: 'level',
                tile: 'tile_3',
                icon: require('../../../../assets/icons/book.png'),
                stars: 0,
                top: '70%', left: '30%',
                scale: 0.7,
                zIndex: 8
            },
            // 4. Separable Verbs
            {
                id: 'separable_verbs',
                title: 'Separable Verbs 🧩',
                type: 'level',
                tile: 'tile_4',
                icon: require('../../../../assets/icons/book.png'),
                stars: 0,
                top: '60%', left: '70%',
                scale: 0.65,
                zIndex: 7
            },
            // 5. Commands (Imperative)
            {
                id: 'imperative',
                title: 'Commands 📢',
                type: 'level',
                tile: 'tile_5',
                icon: require('../../../../assets/icons/book.png'),
                stars: 0,
                top: '50%', left: '40%',
                scale: 0.6,
                zIndex: 6
            },
            // 6. Sentence Master
            {
                id: 'sentence_master',
                title: 'Sentence Master 🏗️',
                type: 'level',
                tile: 'tile_6',
                icon: require('../../../../assets/icons/book.png'),
                stars: 0,
                top: '40%', left: '60%',
                scale: 0.55,
                zIndex: 5
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

                // Check each node in the current phase
                snowStage3.nodes.forEach(node => {
                    if (node.type === 'level') {
                        // Force Sentence Master to be true as requested
                        if (isTileComplete(node.id, grammarProgress)) {
                            completedTileIds.push(node.id);
                        }
                        // Update stars
                        node.stars = getTileStars(node.id, grammarProgress);
                    }
                });

                // 2. Get General Progress (for Chests/Modules)
                const progress = await progressService.getProgress();
                let completedModuleIds = [];
                if (progress && progress.completedModules) {
                    completedModuleIds = progress.completedModules;
                }

                // 3. Merge and Set
                const allCompleted = [...new Set([...completedTileIds, ...completedModuleIds])];
                setCompletedNodes(allCompleted);
            };
            loadProgress();

            // Play Snow Background Music
            Sound.setCategory('Playback', true);
            const soundFile = Platform.OS === 'android' ? 'background_music_2' : 'background_music_2.mp3';

            const music = new Sound(soundFile, Sound.MAIN_BUNDLE, (error) => {
                if (error) {
                    console.log('Failed to load snow sound', error);
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
        navigation.navigate('GrammarListScreen', {
            tileId: node.id,
            title: node.title,
            themeId: 'snow' // Pass themeId for navigation
        });
    };

    const handleFinalTest = () => {
        navigation.navigate('FinalTestScreen');
    };

    return (
        <View style={styles.container}>
            <StatusBar hidden={true} translucent={true} backgroundColor="transparent" />
            <Header showBack={false} />

            <CloudTransition
                visible={isTransitioning}
                onAnimationComplete={() => { }}
            />

            <View style={styles.mapContainer}>
                <PhaseSection
                    phase={snowStage3}
                    onNodePress={handleNodePress}
                    completedNodes={completedNodes}
                />
            </View>

        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#E0F7FA' }, // Snow Blue
    mapContainer: { flex: 1 },
    footerOverlay: { position: 'absolute', bottom: 100, left: 0, right: 0, alignItems: 'center', zIndex: 100 },
    finalTestButton: {
        backgroundColor: '#FF5722',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 30,
        borderWidth: 3,
        borderColor: '#FFCCBC',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    finalTestButtonText: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
});

export default SnowThemeScreen;
