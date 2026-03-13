import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Zap, Timer, Users, ShoppingCart } from 'lucide-react-native';
import { useCart } from '../lib/CartContext';
import { useNotification } from '../lib/NotificationContext';

export const FlashMobDiscount = () => {
    const { addToCart } = useCart();
    const { showNotification } = useNotification();
    
    // 5 Minute Countdown
    const [timeLeft, setTimeLeft] = useState(300);
    const [commitments, setCommitments] = useState(64);
    const [isCommitted, setIsCommitted] = useState(false);
    const goal = 100;

    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    // Random increment for social proof
    useEffect(() => {
        if (timeLeft <= 0 || commitments >= goal) return;
        const interval = setInterval(() => {
            if (Math.random() > 0.7) {
                setCommitments(prev => Math.min(prev + Math.floor(Math.random() * 3) + 1, goal));
            }
        }, 3000);
        return () => clearInterval(interval);
    }, [timeLeft, commitments]);

    const displayMinutes = Math.floor(timeLeft / 60);
    const displaySeconds = timeLeft % 60;
    const progress = (commitments / goal) * 100;

    const handleCommit = () => {
        setIsCommitted(true);
        addToCart({
            id: 777,
            name: "Artisan Truffle Chips (Flash Mob)",
            price: 75, // 50% of 150
            qty: 1,
            type: "Solo"
        });
        showNotification("Committed! Price discounted by 50% in your cart. 🎉", "success");
    };

    if (timeLeft <= 0) return null;

    return (
        <View className="mx-4 mt-6 bg-yellow-50 border-2 border-yellow-400 p-5 rounded-[32px] overflow-hidden shadow-xl shadow-yellow-200/50">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center bg-yellow-400 px-3 py-1.5 rounded-full">
                    <Zap size={14} color="#000" fill="#000" />
                    <Text className="text-black font-black text-[10px] uppercase ml-1.5 tracking-wider">FLASH MOB LIVE</Text>
                </View>
                <View className="flex-row items-center bg-black/5 px-3 py-1.5 rounded-full border border-black/10">
                    <Timer size={14} color="#000" />
                    <Text className="text-black font-black text-[12px] ml-1.5 tabular-nums">
                        {displayMinutes}:{displaySeconds.toString().padStart(2, '0')}
                    </Text>
                </View>
            </View>

            {/* Product Info */}
            <View className="flex-row justify-between items-start mb-5">
                <View className="flex-1">
                    <Text className="text-black/60 font-bold text-xs uppercase mb-1">Limited Time Deal</Text>
                    <Text className="text-black font-black text-2xl tracking-tighter">Artisan Truffle Chips</Text>
                    <View className="flex-row items-center mt-1">
                        <Text className="text-black/40 font-bold text-lg line-through">₹150</Text>
                        <Text className="text-yellow-600 font-black text-2xl ml-2">₹75</Text>
                        <View className="bg-green-100 px-2 py-0.5 rounded-md ml-2 border border-green-200">
                             <Text className="text-green-700 font-black text-[10px]">50% OFF</Text>
                        </View>
                    </View>
                </View>
                <View className="w-16 h-16 bg-white rounded-2xl items-center justify-center border border-yellow-200 shadow-sm">
                    <Text className="text-4xl">🍿</Text>
                </View>
            </View>

            {/* Progress Bar */}
            <View className="mb-6">
                <View className="flex-row justify-between items-end mb-2">
                    <View className="flex-row items-center">
                        <Users size={14} color="#000" />
                        <Text className="text-black font-black text-xs ml-2">{commitments} committed</Text>
                    </View>
                    <Text className="text-black/60 font-bold text-[10px]">GOAL: {goal}</Text>
                </View>
                <View className="h-3 bg-black/10 rounded-full overflow-hidden">
                    <View 
                        className="h-full bg-yellow-400 rounded-full"
                        style={{ width: `${progress}%` }}
                    />
                </View>
                <Text className="text-black/50 text-center font-bold text-[10px] mt-2 italic">Commitments only valid for the next {displayMinutes} mins!</Text>
            </View>

            {/* Action Button */}
            <TouchableOpacity 
                onPress={handleCommit}
                disabled={isCommitted}
                className={`py-4 rounded-2xl flex-row items-center justify-center ${isCommitted ? 'bg-black/5 border border-black/10' : 'bg-black shadow-lg shadow-black/20'}`}
            >
                {isCommitted ? (
                    <Text className="text-black font-black text-sm uppercase tracking-widest">Already Committed</Text>
                ) : (
                    <>
                        <ShoppingCart size={18} color="#FFF" className="mr-2" />
                        <Text className="text-white font-black text-lg uppercase">Commit & Save 50%</Text>
                    </>
                )}
            </TouchableOpacity>
        </View>
    );
};
