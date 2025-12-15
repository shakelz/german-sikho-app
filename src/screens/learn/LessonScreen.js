import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import vocabService from '../../services/vocabService';

const LessonScreen = ({ route, navigation }) => {
  const { moduleId, title } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [lessonData, setLessonData] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Fetch vocab and quiz data in parallel
        const [vocabItems, quizQuestions] = await Promise.all([
          vocabService.fetchVocabItems(moduleId),
          vocabService.fetchQuizQuestions(moduleId)
        ]);

        // Construct lesson data object
        setLessonData({
          id: moduleId,
          title: title,
          description: 'Learn new words and test your knowledge.', // Placeholder or fetch from module details
          items: vocabItems || [],
          quizQuestions: quizQuestions || []
        });
      } catch (error) {
        console.error('Error loading lesson data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (moduleId) {
      loadData();
    }
  }, [moduleId, title]);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backLink}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading lesson...</Text>
        </View>
      </View>
    );
  }

  if (!lessonData || (lessonData.items.length === 0 && lessonData.quizQuestions.length === 0)) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backLink}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <Text style={styles.title}>Content Not Available</Text>
          <Text style={styles.subtitle}>This lesson is coming soon!</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back to Map</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>← Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{lessonData.title}</Text>
        <Text style={styles.description}>{lessonData.description}</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{lessonData.items.length}</Text>
            <Text style={styles.statLabel}>Words</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{lessonData.quizQuestions.length}</Text>
            <Text style={styles.statLabel}>Questions</Text>
          </View>
        </View>

        <View style={styles.modesContainer}>
          <TouchableOpacity
            style={[styles.modeButton, styles.learnButton]}
            onPress={() => navigation.navigate('Learn', { moduleId, lessonData })}
          >
            <Text style={styles.modeIcon}>📖</Text>
            <Text style={styles.modeTitle}>Learn Mode</Text>
            <Text style={styles.modeDesc}>Study with flashcards</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeButton, styles.quizButton]}
            onPress={() => navigation.navigate('Quiz', { moduleId, lessonData })}
          >
            <Text style={styles.modeIcon}>🎯</Text>
            <Text style={styles.modeTitle}>Quiz Mode</Text>
            <Text style={styles.modeDesc}>Test your knowledge</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  header: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backLink: {
    fontSize: 16,
    color: '#007AFF',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 40,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    minWidth: 100,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  modesContainer: {
    gap: 20,
  },
  modeButton: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 15,
  },
  learnButton: {
    borderLeftWidth: 5,
    borderLeftColor: '#4CAF50',
  },
  quizButton: {
    borderLeftWidth: 5,
    borderLeftColor: '#FF9800',
  },
  modeIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  modeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  modeDesc: {
    fontSize: 14,
    color: '#666',
  },
  backButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default LessonScreen;
