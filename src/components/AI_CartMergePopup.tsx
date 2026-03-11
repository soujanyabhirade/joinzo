import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Zap, ShoppingBasket, Plus, X } from 'lucide-react-native';

export const AI_CartMergePopup = ({ onAdd, onDismiss }: { onAdd: () => void, onDismiss: () => void }) => {
    const [timeLeft, setTimeLeft] = useState(60);
    const fadeAnim = new Animated.Value(0);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();

        const timer = setInterval(() => {
            setTimeLeft((prev: number) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    if (timeLeft === 0) return null;

    return (
        <Animated.View
            style={{ opacity: fadeAnim }}
            className="absolute bottom-24 left-4 right-4 bg-neon-green border border-neon-green shadow-2xl rounded-3xl p-6 z-50 flex-row items-center"
        >
            <View className="bg-deep-charcoal w-14 h-14 rounded-full items-center justify-center mr-4">
                <ShoppingBasket size={24} color="#39FF14" />
            </View>

            <View className="flex-1">
                <View className="flex-row items-center mb-1">
                    <Zap size={10} color="#121212" fill="#121212" />
                    <Text className="text-deep-charcoal text-[10px] font-black uppercase ml-1">AI CART-MERGE DETECTED</Text>
                </View>
                <Text className="text-deep-charcoal font-black text-sm">3 others added 'Tea'!</Text>
                <Text className="text-deep-charcoal/80 text-xs font-bold">Add 'Marie Biscuits' for an <Text className="underline">extra 5% off</Text>!</Text>
            </View>

            <View className="items-center">
                <TouchableOpacity
                    onPress={onAdd}
                    className="bg-deep-charcoal px-4 py-2 rounded-xl flex-row items-center mb-2"
                >
                    <Plus size={16} color="#39FF14" />
                    <Text className="text-neon-green font-black ml-1">ADD</Text>
                </TouchableOpacity>
                <Text className="text-deep-charcoal font-black text-[10px]">{timeLeft}s left</Text>
            </View>

            <TouchableOpacity onPress={onDismiss} className="absolute top-2 right-2 p-1">
                <X size={16} color="#121212" />
            </TouchableOpacity>
        </Animated.View>
    );
};
