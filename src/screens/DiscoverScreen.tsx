import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions, ActivityIndicator, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { X, Heart, Home, Play, ShoppingCart, ShoppingBag } from 'lucide-react-native';
import { useCart } from '../lib/CartContext';
import { useNotification } from '../lib/NotificationContext';

const MOCK_SNACKS = [
    { id: 401, name: "Spicy Korean Ramen", price: 110, image: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&q=80&w=400", type: "Solo" as const },
    { id: 402, name: "Matcha Pocky Stakes", price: 145, image: "https://images.unsplash.com/photo-1599557342898-380d69f0bd66?auto=format&fit=crop&q=80&w=400", type: "Solo" as const },
    { id: 403, name: "Sea Salt Dark Chocolate", price: 299, image: "https://images.unsplash.com/photo-1511381939415-e44aa117067b?auto=format&fit=crop&q=80&w=400", type: "Solo" as const },
    { id: 404, name: "Truffle Potato Chips", price: 180, image: "https://images.unsplash.com/photo-1563013734-523ca8ea971ad?auto=format&fit=crop&q=80&w=400", type: "Solo" as const },
];

import { supabase } from '../lib/supabase';

export const DiscoverScreen = ({ navigation }: any) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    const { showNotification } = useNotification();
    
    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .limit(10);
                if (data) setProducts(data);
            } catch (err) {
                console.error('Discover fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTrending();
    }, []);

    const currentSnack = products[currentIndex];

    const handleSwipe = (liked: boolean) => {
        if (liked && currentSnack) {
            if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            addToCart({ 
                id: currentSnack.id, 
                name: currentSnack.name, 
                price: currentSnack.price_solo, 
                qty: 1, 
                type: 'Solo' 
            });
            showNotification(`${currentSnack.name} added to cart! 💖`, "success");
        }
        
        if (currentIndex < products.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setCurrentIndex(products.length);
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
                {loading ? (
                    <ActivityIndicator size="large" color="#5A189A" />
                ) : currentIndex >= products.length ? (
                    <View className="items-center">
                        <Text className="text-white font-black text-2xl mb-2 text-center">You're all caught up!</Text>
                        <Text className="text-gray-400 font-medium text-center px-8">We'll find more trending items for you soon based on your neighborhood loops.</Text>
                        <TouchableOpacity onPress={() => setCurrentIndex(0)} className="mt-8 bg-brand-primary px-10 py-4 rounded-full">
                            <Text className="text-white font-black uppercase tracking-wider">Reload Stack</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="w-full h-[60vh] bg-ui-surface rounded-[40px] overflow-hidden shadow-2xl border border-gray-800 relative">
                        {currentSnack.image_url ? (
                            <Image source={{ uri: currentSnack.image_url }} className="absolute inset-0 w-full h-full bg-gray-900 opacity-90" />
                        ) : (
                            <View className="absolute inset-0 w-full h-full bg-gray-900 items-center justify-center">
                                <ShoppingBag size={80} color="#333" />
                            </View>
                        )}
                        
                        <View className="absolute inset-x-0 bottom-0 h-1/2 bg-black/60" />
                        
                        <View className="absolute bottom-10 left-6 right-6">
                            <Text className="text-brand-primary font-black text-[10px] uppercase tracking-widest mb-2 bg-black/50 self-start px-3 py-1.5 rounded-full border border-brand-primary/50">🔥 Trending in Koramangala</Text>
                            <Text className="text-white font-black text-4xl mb-1 tracking-tighter" numberOfLines={2}>{currentSnack.name}</Text>
                            <Text className="text-white/80 font-bold text-xl">₹{currentSnack.price_solo}</Text>
                        </View>
                    </View>
                )}
            </View>

            {currentIndex < products.length && !loading && (
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
