import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, Platform } from 'react-native';
import { Zap, ShoppingBasket, Plus, X } from 'lucide-react-native';

export const AI_CartMergePopup = ({ onAdd, onDismiss }: { onAdd: () => void, onDismiss: () => void }) => {
    const [timeLeft, setTimeLeft] = useState(60);
    const fadeAnim = new Animated.Value(0);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: Platform.OS !== 'web',
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
            className="absolute bottom-24 left-4 right-4 bg-brand-primary border border-brand-primary shadow-2xl rounded-3xl p-6 z-50 flex-row items-center"
        >
            <View className="bg-ui-background w-14 h-14 rounded-full items-center justify-center mr-4 shadow-sm">
                <ShoppingBasket size={24} color="#5A189A" />
            </View>

            <View className="flex-1">
                <View className="flex-row items-center mb-1">
                    <Zap size={10} color="#FFFFFF" fill="#FFFFFF" />
                    <Text className="text-white text-[10px] font-black uppercase ml-1">AI CART-MERGE DETECTED</Text>
                </View>
                <Text className="text-white font-black text-sm">3 others added 'Tea'!</Text>
                <Text className="text-white/80 text-xs font-bold">Add 'Marie Biscuits' for an <Text className="underline">extra 5% off</Text>!</Text>
            </View>

            <View className="items-center">
                <TouchableOpacity
                    onPress={onAdd}
                    className="bg-ui-background px-4 py-2 rounded-xl flex-row items-center mb-2 shadow-sm"
                >
                    <Plus size={16} color="#5A189A" />
                    <Text className="text-brand-primary font-black ml-1">ADD</Text>
                </TouchableOpacity>
                <Text className="text-white font-black text-[10px]">{timeLeft}s left</Text>
            </View>

            <TouchableOpacity onPress={onDismiss} className="absolute top-2 right-2 p-1">
                <X size={16} color="#FFFFFF" />
            </TouchableOpacity>
        </Animated.View>
    );
};
