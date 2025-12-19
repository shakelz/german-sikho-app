import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ImageBackground, Image } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { getLessonsByTile, getLessonProgress, isLessonUnlocked } from '../../services/GrammarService';
import LinearGradient from 'react-native-linear-gradient';

const GrammarListScreen = ({ route, navigation }) => {
    const { tileId, title, themeId } = route.params;
    const [lessons, setLessons] = useState([]);
    const [progress, setProgress] = useState({});
    const isFocused = useIsFocused();

    useEffect(() => {
        loadData();
    }, [isFocused]);

    const loadData = async () => {
        const tileLessons = getLessonsByTile(tileId);
        setLessons(tileLessons);
        const currentProgress = await getLessonProgress();
        setProgress(currentProgress);
    };

    const handleLessonPress = (lesson) => {
        if (isLessonUnlocked(lesson.id, lessons, progress)) {
            navigation.navigate('GrammarLessonScreen', { lesson, themeId });
        }
    };

    const renderItem = ({ item, index }) => {
        const unlocked = isLessonUnlocked(item.id, lessons, progress);
        const lessonData = progress[item.id];
        const completed = lessonData === true || (lessonData && lessonData.completed);

        return (
            <TouchableOpacity
                style={[styles.lessonCard, !unlocked && styles.lockedCard]}
                onPress={() => handleLessonPress(item)}
                disabled={!unlocked}
            >
                <View style={styles.lessonInfo}>
                    <Text style={styles.lessonTitle}>{index + 1}. {item.title}</Text>
                    <Text style={styles.lessonDesc}>{item.description}</Text>
                </View>
                <View style={styles.statusIcon}>
                    {completed ? (
                        <Text style={styles.checkMark}>✅</Text>
                    ) : !unlocked ? (
                        <Text style={styles.lockIcon}>🔒</Text>
                    ) : (
                        <Text style={styles.playIcon}>▶️</Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <ImageBackground
            source={require('../../assets/icons/forest_background.jpg')} // Default background, can be dynamic
            style={styles.container}
        >
            <View style={styles.overlay}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={styles.backButtonText}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{title}</Text>
                </View>

                <FlatList
                    data={lessons}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                />
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 40, backgroundColor: 'rgba(0,0,0,0.5)' },
    backButton: { padding: 10 },
    backButtonText: { fontSize: 24, color: 'white', fontWeight: 'bold' },
    headerTitle: { fontSize: 24, color: 'white', fontWeight: 'bold', marginLeft: 10 },
    listContent: { padding: 20 },
    lessonCard: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    lockedCard: {
        backgroundColor: '#e0e0e0',
        opacity: 0.8,
    },
    lessonInfo: { flex: 1 },
    lessonTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    lessonDesc: { fontSize: 14, color: '#666', marginTop: 5 },
    statusIcon: { marginLeft: 10 },
    checkMark: { fontSize: 20 },
    lockIcon: { fontSize: 20 },
    playIcon: { fontSize: 20 },
    playIcon: { fontSize: 20 },
});

export default GrammarListScreen;
