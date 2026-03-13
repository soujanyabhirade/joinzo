import React, { useEffect, useState } from 'react';
import { View, Text, Animated, Easing, Dimensions, Platform } from 'react-native';
import { Leaf } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export const CarbonTicker = () => {
    const [translateX] = useState(new Animated.Value(width));
    const [totalSaved, setTotalSaved] = useState(142.8);

    const stats = [
        "🌿 Your neighborhood saved 14.2kg CO2 today",
        "♻️ 82 orders bundled via Loop in the last hour",
        "📉 CO2 emissions reduced by 12% this week",
        "🚲 4 riders switched to EV for your deliveries",
        "🌱 Total Joinzo community impact: 2,401kg CO2 saved"
    ];

    useEffect(() => {
        const startAnimation = () => {
            Animated.loop(
                Animated.timing(translateX, {
                    toValue: -width * 3, // Support longer strings
                    duration: 20000,
                    easing: Easing.linear,
                    useNativeDriver: Platform.OS !== 'web',
                })
            ).start();
        };

        startAnimation();
    }, [translateX]);

    // Slow live update of savings
    useEffect(() => {
        const interval = setInterval(() => {
            setTotalSaved(prev => +(prev + 0.01).toFixed(2));
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <View className="bg-emerald-600/90 py-2.5 flex-row items-center overflow-hidden w-full backdrop-blur-md">
            <View className="bg-white/20 p-1.5 rounded-full mx-3 z-10">
                <Leaf size={12} color="#FFFFFF" fill="#FFFFFF" />
            </View>
            <View className="flex-1 overflow-hidden relative h-4">
                <Animated.View style={{ transform: [{ translateX }], flexDirection: 'row', position: 'absolute' }}>
                    {stats.map((stat, idx) => (
                        <Text key={idx} className="text-white font-black text-[10px] uppercase mr-12 tracking-widest">
                            {stat}
                        </Text>
                    ))}
                </Animated.View>
            </View>
            <View className="bg-emerald-900/40 px-3 py-1 rounded-l-full ml-2 border-l border-y border-white/20">
                <Text className="text-white font-black text-[10px] tabular-nums">{totalSaved}kg SAVED</Text>
            </View>
        </View>
    );
};
