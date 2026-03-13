import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { X, Heart, Home, Play, ShoppingCart } from 'lucide-react-native';
import { useCart } from '../lib/CartContext';
import { useNotification } from '../lib/NotificationContext';

const MOCK_SNACKS = [
    { id: 401, name: "Spicy Korean Ramen", price: 110, image: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&q=80&w=400", type: "Solo" as const },
    { id: 402, name: "Matcha Pocky Stakes", price: 145, image: "https://images.unsplash.com/photo-1599557342898-380d69f0bd66?auto=format&fit=crop&q=80&w=400", type: "Solo" as const },
    { id: 403, name: "Sea Salt Dark Chocolate", price: 299, image: "https://images.unsplash.com/photo-1511381939415-e44aa117067b?auto=format&fit=crop&q=80&w=400", type: "Solo" as const },
    { id: 404, name: "Truffle Potato Chips", price: 180, image: "https://images.unsplash.com/photo-1563013734-523ca8ea971ad?auto=format&fit=crop&q=80&w=400", type: "Solo" as const },
];

export const DiscoverScreen = ({ navigation }: any) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const { addToCart } = useCart();
    const { showNotification } = useNotification();
    
    const currentSnack = MOCK_SNACKS[currentIndex];

    const handleSwipe = (liked: boolean) => {
        if (liked && currentSnack) {
            addToCart({ ...currentSnack, qty: 1 });
            showNotification(`${currentSnack.name} added to cart! 💖`, "success");
        }
        
        if (currentIndex < MOCK_SNACKS.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setCurrentIndex(MOCK_SNACKS.length); // End of list
        }
    };

    return (
        <View className="flex-1 bg-[#1A1A1A]">
            <View className="px-6 py-6 pt-12 flex-row justify-between items-center z-10">
                <Text className="text-white font-black text-2xl tracking-tight">DISCOVER</Text>
                <View className="flex-row items-center gap-3">
                    <TouchableOpacity 
                        onPress={() => navigation.navigate("Loomvids")} 
                        className="bg-brand-primary p-3 rounded-full border border-brand-primary/20 shadow-lg shadow-brand-primary/20"
                    >
                        <Play size={20} color="#FFF" fill="#FFF" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate("Home")} className="bg-white/10 p-3 rounded-full border border-white/20">
                        <Home size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </View>

            <View className="flex-1 items-center justify-center p-6">
                {currentIndex >= MOCK_SNACKS.length ? (
                    <View className="items-center">
                        <Text className="text-white font-black text-2xl mb-2">You're all caught up!</Text>
                        <Text className="text-gray-400 font-medium text-center">We'll find more trending snacks for you soon.</Text>
                        <TouchableOpacity onPress={() => setCurrentIndex(0)} className="mt-8 bg-brand-primary px-8 py-4 rounded-full">
                            <Text className="text-white font-black">Reload Stack</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="w-full h-[60vh] bg-ui-surface rounded-[40px] overflow-hidden shadow-2xl border border-gray-800 relative">
                        <Image source={{ uri: currentSnack.image }} className="absolute inset-0 w-full h-full bg-gray-900 opacity-90" />
                        
                        {/* Gradient overlay for text readability */}
                        <View className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black to-transparent" />
                        
                        <View className="absolute bottom-10 left-6 right-6">
                            <Text className="text-brand-primary font-black text-xs uppercase tracking-widest mb-2 bg-black/50 self-start px-3 py-1 rounded-full border border-brand-primary/50">Trending Now</Text>
                            <Text className="text-white font-black text-4xl mb-1">{currentSnack.name}</Text>
                            <Text className="text-white/80 font-bold text-xl">₹{currentSnack.price}</Text>
                        </View>
                    </View>
                )}
            </View>

            {currentIndex < MOCK_SNACKS.length && (
                <View className="flex-row justify-center items-center pb-12 gap-8">
                    <TouchableOpacity 
                        onPress={() => handleSwipe(false)}
                        className="w-16 h-16 bg-ui-surface rounded-full items-center justify-center border-2 border-red-500 shadow-lg shadow-red-500/20"
                    >
                        <X size={32} color="#EF4444" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={() => handleSwipe(true)}
                        className="w-20 h-20 bg-ui-surface rounded-full items-center justify-center border-2 border-green-500 shadow-xl shadow-green-500/30"
                    >
                        <View className="relative">
                            <Heart size={40} color="#10B981" fill="#10B981" />
                            <View className="absolute -top-1 -right-1 bg-white rounded-full p-1 border border-green-500">
                                <ShoppingCart size={12} color="#10B981" />
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};
