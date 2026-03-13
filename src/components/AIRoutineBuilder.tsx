import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Sparkles, ShoppingCart, RefreshCcw, ChevronRight } from 'lucide-react-native';
import { useCart } from '../lib/CartContext';
import { useNotification } from '../lib/NotificationContext';

export const AIRoutineBuilder = () => {
    const { addToCart } = useCart();
    const { showNotification } = useNotification();

    const routineItems = [
        { id: 1001, name: "Organic Whole Milk", price: 65, qty: 2 },
        { id: 1002, name: "Brown Bread (Atta)", price: 45, qty: 1 },
        { id: 1003, name: "Farm Fresh Eggs (6)", price: 55, qty: 1 },
    ];

    const handleOneTapRestock = () => {
        routineItems.forEach(item => {
            addToCart({ ...item, type: "Solo" });
        });
        showNotification("Your weekly essentials have been added to the cart! 🥛🍞", "success");
    };

    return (
        <View className="mx-4 mt-6 bg-indigo-50 rounded-[32px] p-6 border border-indigo-100 shadow-sm overflow-hidden">
            <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-indigo-500 rounded-2xl items-center justify-center border border-white/20 shadow-md">
                        <Sparkles size={20} color="#FFF" />
                    </View>
                    <View className="ml-3">
                        <Text className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Personalized AI</Text>
                        <Text className="text-text-primary font-black text-lg">Your Weekly Routine</Text>
                    </View>
                </View>
                <TouchableOpacity className="bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                    <RefreshCcw size={16} color="#4F46E5" />
                </TouchableOpacity>
            </View>

            <Text className="text-text-secondary text-xs font-bold mb-4">Based on your last 4 weeks, you usually restock these on Fridays:</Text>

            <View className="gap-3 mb-6">
                {routineItems.map((item) => (
                    <View key={item.id} className="flex-row items-center justify-between bg-white/60 p-3 rounded-2xl border border-white/80">
                        <View className="flex-row items-center">
                            <View className="w-8 h-8 bg-indigo-100 rounded-lg items-center justify-center mr-3">
                                <Text className="text-[10px] font-black text-indigo-600">{item.qty}x</Text>
                            </View>
                            <Text className="text-text-primary font-bold text-sm tracking-tight">{item.name}</Text>
                        </View>
                        <Text className="text-text-primary font-black text-sm">₹{item.price * item.qty}</Text>
                    </View>
                ))}
            </View>

            <TouchableOpacity 
                onPress={handleOneTapRestock}
                className="bg-indigo-600 p-5 rounded-2xl flex-row items-center justify-between shadow-lg shadow-indigo-400/40"
            >
                <View className="flex-row items-center">
                    <ShoppingCart size={20} color="#FFF" />
                    <Text className="text-white font-black text-sm ml-3 uppercase tracking-wider">One-Tap Restock</Text>
                </View>
                <View className="flex-row items-center bg-white/20 px-3 py-1.5 rounded-full">
                    <Text className="text-white font-black text-xs mr-1">₹175</Text>
                    <ChevronRight size={14} color="#FFF" />
                </View>
            </TouchableOpacity>
        </View>
    );
};
