import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// --- GAMIFIED SCREENS ---
import WorldSelectScreen from '../screens/gamified/WorldSelectScreen'; // Was Levels.js
import MapScreen from '../screens/gamified/MapScreen'; // Was GamifiedHome.js

// --- LEARNING SCREENS ---
import LessonScreen from '../screens/learn/LessonScreen'; // Was Lesson.js
import FlashcardScreen from '../screens/learn/FlashcardScreen'; // Was Learn.js
import VocabPlayground from '../screens/gamified/VocabPlayground';
import GrammarLesson from '../screens/learn/GrammarLesson'; // (Keep generic one)
import ArticlesGrammar from '../screens/learn/ArticlesGrammar';
import VocabularyLesson from '../screens/learn/VocabularyLesson'; // (Keep generic one)
import QuizScreen from '../screens/learn/QuizScreen'; // Was QuizModal.js
import GrammarListScreen from '../screens/learn/GrammarListScreen';
import GrammarLessonScreen from '../screens/learn/GrammarLessonScreen';

// --- PROFILE SCREENS ---
import Profile from '../screens/profile/Profile';
import Settings from '../screens/profile/Settings';
import ChangePassword from '../screens/profile/ChangePassword'; // Ensure this file exists in profile/

// --- UTILS ---
import TTSDebugScreen from '../screens/TTSDebugScreen'; // Adjust path if you moved it
import ResultModal from '../screens/modals/ResultModal'; // Keep this as a modal

const Stack = createNativeStackNavigator();

const AppStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="WorldSelect">

            {/* 1. Main Navigation Flow */}
            <Stack.Screen name="WorldSelect" component={WorldSelectScreen} />
            <Stack.Screen name="MapScreen" component={MapScreen} />

            {/* 2. Learning Features */}
            <Stack.Screen name="Lesson" component={LessonScreen} />
            <Stack.Screen name="Learn" component={FlashcardScreen} />
            <Stack.Screen name="VocabPlayground" component={VocabPlayground} />

            {/* 3. Specific Lessons */}
            <Stack.Screen name="GrammarLesson" component={GrammarLesson} />
            <Stack.Screen name="ArticlesGrammar" component={ArticlesGrammar} />
            <Stack.Screen name="VocabularyLesson" component={VocabularyLesson} />
            <Stack.Screen name="GrammarListScreen" component={GrammarListScreen} />
            <Stack.Screen name="GrammarLessonScreen" component={GrammarLessonScreen} />

            {/* 4. Quiz (Now a Screen) */}
            <Stack.Screen name="Quiz" component={QuizScreen} />

            {/* 5. Profile Section */}
            <Stack.Screen name="Profile" component={Profile} />
            <Stack.Screen name="Settings" component={Settings} />
            <Stack.Screen name="ChangePassword" component={ChangePassword} />

            {/* 6. Utilities & Result Modal */}
            <Stack.Screen name="TTSDebug" component={TTSDebugScreen} />

            <Stack.Group screenOptions={{ presentation: 'transparentModal' }}>
                <Stack.Screen name="Result" component={ResultModal} />
            </Stack.Group>

        </Stack.Navigator>
    );
};

export default AppStack;