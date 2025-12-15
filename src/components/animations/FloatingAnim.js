import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

const FloatingAnim = ({
    children,
    duration = 3000,
    distance = 10,
    delay = 0,
    style
}) => {
    const translateY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const startAnimation = () => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(translateY, {
                        toValue: -distance,
                        duration: duration,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                    Animated.timing(translateY, {
                        toValue: 0,
                        duration: duration,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        };

        const timeout = setTimeout(startAnimation, delay);
        return () => clearTimeout(timeout);
    }, [translateY, duration, distance, delay]);

    return (
        <Animated.View style={[style, { transform: [{ translateY }] }]}>
            {children}
        </Animated.View>
    );
};

export default FloatingAnim;
