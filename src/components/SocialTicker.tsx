import React, { useEffect, useState } from 'react';
import { View, Text, Animated, Easing, Dimensions, Platform } from 'react-native';
import { Zap } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export const SocialTicker = () => {
    const [translateX] = useState(new Animated.Value(width));

    const events = [
        "🔥 Rohan joined a Loop for Farm Fresh Eggs",
        "⚡ 3 people bought Avocados in the last minute",
        "🎉 Joinzo delivered an order to Gate 2 in 8 mins",
        "💧 Simran saved ₹40 on packaged drinking water",
        "🚀 10+ people are buying snacks in Skyline Apartments"
    ];

    useEffect(() => {
        const startAnimation = () => {
            Animated.loop(
                Animated.timing(translateX, {
                    toValue: -width * 2, // Arbitrary distance to scroll off-screen completely
                    duration: 15000, // 15 seconds for a full pass
                    easing: Easing.linear,
                    useNativeDriver: Platform.OS !== 'web',
                })
            ).start();
        };

        startAnimation();
    }, [translateX]);

    return (
        <View className="bg-brand-primary p-3 flex-row items-center overflow-hidden w-full shadow-t-xl absolute bottom-0 z-50">
            <View className="bg-white/20 p-1 rounded-full mr-2 z-10">
                <Zap size={14} color="#FFFFFF" />
            </View>
            <View className="flex-1 overflow-hidden relative h-5">
                <Animated.View style={{ transform: [{ translateX }], flexDirection: 'row', position: 'absolute' }}>
                    {events.map((evt, idx) => (
                        <Text key={idx} className="text-white font-bold text-xs mr-10 whitespace-nowrap">
                            {evt}
                        </Text>
                    ))}
                </Animated.View>
            </View>
        </View>
    );
};
