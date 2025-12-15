import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

const ShineAnim = ({
    children,
    duration = 3000,
    style
}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(0.6)).current;

    useEffect(() => {
        const startAnimation = () => {
            Animated.loop(
                Animated.parallel([
                    // Pulse Scale
                    Animated.sequence([
                        Animated.timing(scaleAnim, {
                            toValue: 1.15,
                            duration: duration,
                            easing: Easing.inOut(Easing.ease),
                            useNativeDriver: true,
                        }),
                        Animated.timing(scaleAnim, {
                            toValue: 1,
                            duration: duration,
                            easing: Easing.inOut(Easing.ease),
                            useNativeDriver: true,
                        }),
                    ]),
                    // Pulse Opacity
                    Animated.sequence([
                        Animated.timing(opacityAnim, {
                            toValue: 1,
                            duration: duration,
                            easing: Easing.inOut(Easing.ease),
                            useNativeDriver: true,
                        }),
                        Animated.timing(opacityAnim, {
                            toValue: 0.6,
                            duration: duration,
                            easing: Easing.inOut(Easing.ease),
                            useNativeDriver: true,
                        }),
                    ])
                ])
            ).start();
        };

        startAnimation();
    }, [scaleAnim, opacityAnim, duration]);

    return (
        <Animated.View style={[style, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
            {children}
        </Animated.View>
    );
};

export default ShineAnim;
