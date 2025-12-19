import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const GrammarLessonScreen = ({ route, navigation }) => {
    const { lesson, themeId } = route.params;

    const renderSection = (section, index) => {
        if (section.type === 'text') {
            return (
                <Text key={index} style={styles.textSection}>
                    {section.content}
                </Text>
            );
        } else if (section.type === 'table') {
            return (
                <View key={index} style={styles.tableContainer}>
                    <View style={styles.tableHeader}>
                        {section.headers.map((header, i) => (
                            <Text key={i} style={styles.headerText}>{header}</Text>
                        ))}
                    </View>
                    {section.rows.map((row, rIndex) => (
                        <View key={rIndex} style={styles.tableRow}>
                            {row.map((cell, cIndex) => (
                                <Text key={cIndex} style={styles.cellText}>
                                    {renderHighlightedText(cell, section.highlight_pattern)}
                                </Text>
                            ))}
                        </View>
                    ))}
                </View>
            );
        } else if (section.type === 'tip') {
            return (
                <View key={index} style={styles.tipContainer}>
                    <Text style={styles.tipText}>💡 {section.content}</Text>
                </View>
            );
        }
        return null;
    };

    const renderHighlightedText = (text, pattern) => {
        if (!pattern) return text;
        const regex = new RegExp(`(${pattern})`, 'g');
        const parts = text.split(regex);
        return parts.map((part, i) => {
            if (part.match(regex)) {
                return <Text key={i} style={styles.highlightedText}>{part}</Text>;
            }
            return part;
        });
    };

    return (
        <ImageBackground
            source={require('../../assets/icons/forest_background.jpg')}
            style={styles.container}
        >
            <View style={styles.overlay}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={styles.backButtonText}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{lesson.title}</Text>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.insightBox}>
                        <Text style={styles.insightTitle}>🇮🇳 Hindi Insight</Text>
                        <Text style={styles.insightText}>{lesson.comparison_hint.hindi}</Text>
                        <View style={styles.divider} />
                        <Text style={styles.insightTitle}>🇬🇧 English Insight</Text>
                        <Text style={styles.insightText}>{lesson.comparison_hint.english}</Text>
                    </View>

                    {lesson.sections.map((section, index) => renderSection(section, index))}

                    <TouchableOpacity
                        style={styles.quizButton}
                        onPress={() => navigation.navigate('Quiz', {
                            lessonData: {
                                ...lesson,
                                quizQuestions: lesson.quiz,
                                moduleId: lesson.id
                            },
                            themeId: themeId || 'jungle' // Pass themeId, default to jungle if missing
                        })}
                    >
                        <LinearGradient
                            colors={['#4CAF50', '#2E7D32']}
                            style={styles.quizGradient}
                        >
                            <Text style={styles.quizButtonText}>Start Quiz</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    overlay: { flex: 1, backgroundColor: 'rgba(255,255,255,0.9)' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 40, backgroundColor: '#4CAF50' },
    backButton: { padding: 10 },
    backButtonText: { fontSize: 24, color: 'white', fontWeight: 'bold' },
    headerTitle: { fontSize: 20, color: 'white', fontWeight: 'bold', marginLeft: 10, flex: 1 },
    content: { padding: 20, paddingBottom: 40 },
    insightBox: {
        backgroundColor: '#FFF3E0',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#FFB74D',
    },
    insightTitle: { fontWeight: 'bold', color: '#E65100', marginBottom: 5 },
    insightText: { color: '#5D4037', marginBottom: 10 },
    divider: { height: 1, backgroundColor: '#FFB74D', marginVertical: 10 },
    textSection: { fontSize: 16, color: '#333', marginBottom: 15, lineHeight: 24 },
    tableContainer: {
        backgroundColor: 'white',
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 20,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#eee',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f5f5f5',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    headerText: { flex: 1, fontWeight: 'bold', color: '#333', textAlign: 'center' },
    tableRow: {
        flexDirection: 'row',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    cellText: { flex: 1, color: '#333', textAlign: 'center' },
    highlightedText: { fontWeight: 'bold', color: '#D32F2F' },
    tipContainer: {
        backgroundColor: '#E3F2FD',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        borderLeftWidth: 5,
        borderLeftColor: '#2196F3',
    },
    tipText: { color: '#0D47A1', fontStyle: 'italic' },
    quizButton: { marginTop: 20, borderRadius: 25, overflow: 'hidden' },
    quizGradient: { padding: 15, alignItems: 'center' },
    quizButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});

export default GrammarLessonScreen;
