import React, { useState, useCallback } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import storage from '../../services/storage';
import { WORLD_THEMES, DEFAULT_THEME } from '../../config/worldThemes';

// Import the 3 themes
import WorldSelect_Standard from '../../components/themes/WorldSelect_Standard';
import WorldSelect_Glass from '../../components/themes/WorldSelect_Glass';
import WorldSelect_Cinematic from '../../components/themes/WorldSelect_Cinematic';

const WorldSelectScreen = ({ navigation }) => {
    const [currentTheme, setCurrentTheme] = useState(null);

    useFocusEffect(
        useCallback(() => {
            const loadTheme = async () => {
                try {
                    const saved = await storage.load('world_theme');
                    setCurrentTheme(saved || DEFAULT_THEME);
                } catch (err) {
                    setCurrentTheme(DEFAULT_THEME);
                }
            };
            loadTheme();
        }, [])
    );

    if (!currentTheme) {
        return <View style={{ flex: 1, backgroundColor: '#020617' }} />;
    }

    switch (currentTheme) {
        case WORLD_THEMES.GLASS:
            return <WorldSelect_Glass navigation={navigation} />;
        case WORLD_THEMES.CINEMATIC:
            return <WorldSelect_Cinematic navigation={navigation} />;
        case WORLD_THEMES.STANDARD:
        default:
            return <WorldSelect_Standard navigation={navigation} />;
    }
};

export default WorldSelectScreen;