import React from 'react';
import { View, Text, TouchableOpacity, Share } from 'react-native';
import { Users, Share2, MessageCircle } from 'lucide-react-native';

interface LoopEngineProps {
    itemName: string;
    currentMembers: number;
    neededMembers: number;
    discount: string;
}

export const LoopEngine = ({ itemName, currentMembers, neededMembers, discount }: LoopEngineProps) => {
    const progress = (currentMembers / neededMembers) * 100;

    const onShare = async () => {
        try {
            await Share.share({
                message: `Join my ${itemName} Loop on Joinzo and unlock ${discount} discount! 🚀 We only need ${neededMembers - currentMembers} more to unlock!`,
            });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <View className="bg-soft-gray border border-gray-800 rounded-3xl p-6 mt-6 shadow-2xl">
            <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                    <View className="w-10 h-10 rounded-full bg-neon-green/20 items-center justify-center border border-neon-green/50">
                        <Users size={20} color="#39FF14" />
                    </View>
                    <View className="ml-3">
                        <Text className="text-white font-black text-lg uppercase tracking-tight">{itemName} LOOP</Text>
                        <Text className="text-gray-500 text-xs font-bold">STATUS: UNLOCKING {discount} OFF</Text>
                    </View>
                </View>
                <View className="bg-neon-green px-3 py-1 rounded-full">
                    <Text className="text-deep-charcoal text-[10px] font-black uppercase">{currentMembers}/{neededMembers} JOINED</Text>
                </View>
            </View>

            {/* Progress Bar */}
            <View className="h-4 bg-deep-charcoal rounded-full overflow-hidden border border-gray-800 mb-2">
                <View
                    className="h-full bg-neon-green rounded-full"
                    style={{ width: `${progress}%` }}
                />
            </View>
            <View className="flex-row justify-between items-center px-1">
                <Text className="text-gray-500 text-[10px] font-bold">START</Text>
                <Text className="text-neon-green text-[10px] font-black">{neededMembers - currentMembers} MORE TO UNLOCK</Text>
                <Text className="text-gray-500 text-[10px] font-bold">GOAL</Text>
            </View>

            {/* WhatsApp Sync Button */}
            <TouchableOpacity
                onPress={onShare}
                className="mt-6 bg-[#25D366] py-4 rounded-2xl flex-row items-center justify-center shadow-lg"
            >
                <MessageCircle size={20} color="white" fill="white" />
                <Text className="text-white font-black ml-2 uppercase tracking-tight">Invite via WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={onShare}
                className="mt-3 bg-soft-gray border border-gray-700 py-3 rounded-2xl flex-row items-center justify-center"
            >
                <Share2 size={18} color="#9CA3AF" />
                <Text className="text-gray-400 font-bold ml-2">Copy Link</Text>
            </TouchableOpacity>
        </View>
    );
};
