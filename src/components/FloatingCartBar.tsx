import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ShoppingBag, ChevronRight } from 'lucide-react-native';
import { useCart } from '../lib/CartContext';
import { useNavigation } from '@react-navigation/native';
import { CartMeter } from './CartMeter';

export const FloatingCartBar = () => {
    const { cartItems } = useCart();
    const navigation = useNavigation<any>();

    if (cartItems.length === 0) return null;

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const count = cartItems.reduce((sum, item) => sum + item.qty, 0);

    return (
        <View className="absolute bottom-6 left-4 right-4 z-50">
            <TouchableOpacity 
                activeOpacity={0.9}
                onPress={() => navigation.navigate('Checkout')}
                className="bg-brand-primary p-4 rounded-[28px] shadow-2xl shadow-brand-primary/60 border border-white/20"
            >
                <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center">
                        <View className="bg-white/20 p-2 rounded-xl border border-white/20">
                            <ShoppingBag size={20} color="white" />
                        </View>
                        <View className="ml-3">
                            <Text className="text-white font-black text-lg tracking-tighter">{count} {count === 1 ? 'Item' : 'Items'}</Text>
                            <Text className="text-white/80 font-bold text-xs uppercase">₹{total} Total</Text>
                        </View>
                    </View>
                    <View className="flex-row items-center bg-white/10 px-4 py-2 rounded-2xl border border-white/20">
                        <Text className="text-white font-black text-sm mr-1 uppercase">View Cart</Text>
                        <ChevronRight size={16} color="white" />
                    </View>
                </View>

                {/* Upsell Progress */}
                <View className="bg-white/10 p-3 rounded-2xl border border-white/10">
                    <CartMeter total={total} />
                </View>
            </TouchableOpacity>
        </View>
    );
};
