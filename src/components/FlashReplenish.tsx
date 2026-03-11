import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Bell, Zap } from 'lucide-react-native';

interface FlashReplenishProps {
    itemName: string;
    onNotify: () => void;
}

export const FlashReplenish = ({ itemName, onNotify }: FlashReplenishProps) => {
    return (
        <View className="bg-soft-gray border border-red-500/30 rounded-3xl p-5 mt-4 flex-row items-center border-dashed">
            <View className="bg-red-500/10 w-12 h-12 rounded-full items-center justify-center mr-4">
                <Zap size={20} color="#EF4444" fill="#EF4444" />
            </View>

            <View className="flex-1">
                <View className="flex-row items-center mb-1">
                    <Text className="text-red-500 text-[10px] font-black uppercase">OUT OF STOCK</Text>
                    <View className="bg-red-500 w-1.5 h-1.5 rounded-full ml-1.5 animate-pulse" />
                </View>
                <Text className="text-white font-bold text-sm tracking-tight">{itemName}</Text>
                <Text className="text-gray-500 text-[10px] font-medium uppercase mt-0.5">Stocking Now • 10 Mins</Text>
            </View>

            <TouchableOpacity
                onPress={onNotify}
                className="bg-deep-charcoal border border-gray-800 p-3 rounded-2xl flex-row items-center"
            >
                <Bell size={16} color="#39FF14" />
                <Text className="text-neon-green font-bold text-xs ml-2">NOTIFY</Text>
            </TouchableOpacity>
        </View>
    );
};
