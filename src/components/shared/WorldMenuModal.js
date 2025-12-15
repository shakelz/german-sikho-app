import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';

const WorldMenuModal = ({ visible, onClose, phase, onSelectModule }) => {
    if (!phase) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: phase.color }]}>{phase.title} Vocabulary</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.subtitle}>Select a topic to practice:</Text>

                    <ScrollView style={styles.listContainer}>
                        {phase.modules.map((module) => (
                            <TouchableOpacity
                                key={module.id}
                                style={[styles.moduleItem, { borderLeftColor: phase.color }]}
                                onPress={() => {
                                    onClose();
                                    onSelectModule(module);
                                }}
                            >
                                <Text style={styles.moduleIcon}>{module.type === 'grammar' ? '📖' : '🗣️'}</Text>
                                <View style={styles.moduleInfo}>
                                    <Text style={styles.moduleTitle}>{module.title}</Text>
                                    <Text style={styles.moduleDesc} numberOfLines={1}>
                                        Practice vocabulary for this topic
                                    </Text>
                                </View>
                                <Text style={styles.arrow}>›</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 5,
    },
    closeButtonText: {
        fontSize: 20,
        color: '#999',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
    },
    listContainer: {
        marginBottom: 20,
    },
    moduleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        marginBottom: 10,
        borderLeftWidth: 4,
    },
    moduleIcon: {
        fontSize: 24,
        marginRight: 15,
    },
    moduleInfo: {
        flex: 1,
    },
    moduleTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    moduleDesc: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    arrow: {
        fontSize: 20,
        color: '#ccc',
        fontWeight: 'bold',
    },
});

export default WorldMenuModal;
