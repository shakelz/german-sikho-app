import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, Dimensions, Image } from 'react-native';

const { width, height } = Dimensions.get('window');

const TutorialOverlay = ({ visible, steps, onFinish }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        if (visible) {
            setCurrentStep(0);
            startAnimation();
        }
    }, [visible]);

    const startAnimation = () => {
        fadeAnim.setValue(0);
        slideAnim.setValue(50);

        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            // Fade out slightly before next step
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }).start(() => {
                setCurrentStep(currentStep + 1);
                startAnimation();
            });
        } else {
            onFinish();
        }
    };

    if (!visible) return null;

    const step = steps[currentStep];

    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.overlay}>
                <Animated.View
                    style={[
                        styles.card,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    {/* Icon/Image */}
                    <View style={styles.iconContainer}>
                        <Text style={styles.icon}>{step.icon}</Text>
                    </View>

                    {/* Content */}
                    <Text style={styles.title}>{step.title}</Text>
                    <Text style={styles.description}>{step.description}</Text>

                    {/* Pagination Dots */}
                    <View style={styles.dotsContainer}>
                        {steps.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.dot,
                                    index === currentStep && styles.activeDot,
                                ]}
                            />
                        ))}
                    </View>

                    {/* Button */}
                    <TouchableOpacity style={styles.button} onPress={handleNext}>
                        <Text style={styles.buttonText}>
                            {currentStep === steps.length - 1 ? "Let's Go! 🚀" : 'Next'}
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
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
        padding: 20,
    },
    card: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 30,
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    iconContainer: {
        width: 80,
        height: 80,
        backgroundColor: '#E0F2FE', // Light Blue
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    icon: {
        fontSize: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 30,
    },
    dotsContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#DDD',
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: '#0EA5E9', // Sky Blue
        width: 20,
    },
    button: {
        backgroundColor: '#0EA5E9',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default TutorialOverlay;
