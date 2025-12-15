import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const PhaseCompleteModal = ({ visible, rewardAmount, onClose }) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <LinearGradient
                        colors={['#FFF', '#F0F9FF']}
                        style={styles.content}
                    >
                        <Text style={styles.emoji}>🎉</Text>
                        <Text style={styles.title}>Phase Complete!</Text>
                        <Text style={styles.subtitle}>You've mastered this area!</Text>

                        <View style={styles.rewardBox}>
                            <Text style={styles.rewardLabel}>Reward</Text>
                            <View style={styles.coinRow}>
                                <Text style={styles.coinEmoji}>🪙</Text>
                                <Text style={styles.coinText}>+{rewardAmount}</Text>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.button} onPress={onClose}>
                            <LinearGradient
                                colors={['#4ADE80', '#22C55E']}
                                style={styles.buttonGradient}
                            >
                                <Text style={styles.buttonText}>Claim Reward</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: width * 0.85,
        borderRadius: 25,
        elevation: 10,
        overflow: 'hidden',
    },
    content: {
        padding: 30,
        alignItems: 'center',
    },
    emoji: {
        fontSize: 60,
        marginBottom: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 25,
        textAlign: 'center',
    },
    rewardBox: {
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 15,
        alignItems: 'center',
        marginBottom: 25,
        borderWidth: 2,
        borderColor: '#FCD34D',
    },
    rewardLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#B45309',
        textTransform: 'uppercase',
        marginBottom: 5,
    },
    coinRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    coinEmoji: {
        fontSize: 24,
        marginRight: 8,
    },
    coinText: {
        fontSize: 32,
        fontWeight: '900',
        color: '#D97706',
    },
    button: {
        width: '100%',
        borderRadius: 15,
        overflow: 'hidden',
        elevation: 3,
    },
    buttonGradient: {
        paddingVertical: 15,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default PhaseCompleteModal;
