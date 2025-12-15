import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Dimensions, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

// Asset for Vocabulary (using book.png as requested for "vocabularies")
const vocabIcon = require('../../assets/icons/book.png');

const Footer = ({ onVocabularyPress }) => {
    return (
        <View style={styles.container}>
            {/* Main Floating Button Container */}
            <View style={styles.buttonWrapper}>
                <TouchableOpacity
                    onPress={onVocabularyPress}
                    activeOpacity={0.8}
                    style={styles.touchable}
                >
                    <LinearGradient
                        colors={['#FFC800', '#FFA500']} // Gold/Orange gradient
                        style={styles.gradientButton}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                    >
                        <Image source={vocabIcon} style={styles.icon} resizeMode="contain" />
                    </LinearGradient>
                </TouchableOpacity>

                {/* Label Badge */}
                <View style={styles.labelContainer}>
                    <Text style={styles.labelText}>VOCAB PLAYGROUND</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        pointerEvents: 'box-none', // Allow touches to pass through empty areas
    },
    buttonWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    touchable: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    gradientButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: '#FFFFFF',
    },
    icon: {
        width: 45,
        height: 45,
    },
    labelContainer: {
        marginTop: -15, // Overlap bottom of button
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 4,
    },
    labelText: {
        fontSize: 12,
        fontWeight: '900',
        color: '#4B5563',
        letterSpacing: 1,
    },
});

export default Footer;
