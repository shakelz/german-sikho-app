import React, { useCallback } from 'react';
import { View, Text, StyleSheet, BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

// ✅ Correct Import Path from gamified folder down to themes
import JungleThemeScreen from './themes/A1/JungleThemeScreen';
import DesertThemeScreen from './themes/A1/DesertThemeScreen';
import SnowThemeScreen from './themes/A1/SnowThemeScreen';
import LavaThemeScreen from './themes/A1/LavaThemeScreen';

const MapScreen = ({ navigation, route }) => {
    // Get parameters passed from WorldSelectScreen
    const { themeId } = route.params || { themeId: 'jungle' };

    console.log(`🗺️ MapScreen Manager: Loading ${themeId}...`);

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                if (navigation.canGoBack()) {
                    navigation.goBack();
                } else {
                    navigation.navigate('WorldSelect');
                }
                return true;
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => subscription.remove();
        }, [navigation])
    );

    return (
        <View style={styles.container}>
            {/* Conditional Rendering */}
            {themeId === 'jungle' ? (
                <JungleThemeScreen navigation={navigation} />
            ) : themeId === 'desert' ? (
                <DesertThemeScreen navigation={navigation} />
            ) : themeId === 'snow' ? (
                <SnowThemeScreen navigation={navigation} />
            ) : themeId === 'lava' ? (
                <LavaThemeScreen navigation={navigation} />
            ) : (
                <View style={styles.placeholder}>
                    <Text>Coming Soon!</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    placeholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FDE047'
    }
});

export default MapScreen;