import React from 'react';
import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';

/**
 * ChatFAB - Floating Action Button for AI Chat Assistant
 * Usage: <ChatFAB navigation={navigation} />
 * Place this OUTSIDE of ScrollView to keep it fixed on screen
 */
const ChatFAB = ({ navigation }) => {
    const handlePress = () => {
        navigation.navigate('ChatAssistant');
    };

    return (
        <TouchableOpacity
            style={styles.fab}
            onPress={handlePress}
            activeOpacity={0.85}
        >
            <View style={styles.fabInner}>
                <Text style={styles.fabIcon}>🤖</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        bottom: 100,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#58CC02',
        justifyContent: 'center',
        alignItems: 'center',
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        // Elevation for Android
        elevation: 8,
        zIndex: 999,
    },
    fabInner: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#58CC02',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    fabIcon: {
        fontSize: 28,
    },
});

export default ChatFAB;
