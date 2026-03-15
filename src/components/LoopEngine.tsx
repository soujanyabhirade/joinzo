import React from 'react';
import { View, Text, TouchableOpacity, Share } from 'react-native';
import { Users, Share2, MessageCircle } from 'lucide-react-native';
import { CONFIG } from '../lib/config';

interface LoopEngineProps {
    itemName: string;
    currentMembers: number;
    neededMembers: number;
    discount: string;
    teamId?: string;
}

export const LoopEngine = ({ itemName, currentMembers, neededMembers, discount, teamId }: LoopEngineProps) => {
    const progress = (currentMembers / neededMembers) * 100;

    const onShare = async () => {
        const id = teamId || 'organic-milk-loop';
        const link = `${CONFIG.APP_BASE_URL}/?teamId=${id}`;
        
        // On iOS, Share.share appends the URL automatically if url is provided.
        // On Web/Android, it's better to include it in the message string.
        const message = `Join my ${itemName} Loop on Joinzo and unlock ${discount} discount! 🚀\n\nWe only need ${neededMembers - currentMembers} more to unlock!\n\nJoin Link: ${link}`;
        
        try {
            await Share.share({
                message: message,
                // Removing url property here to prevent duplication, as it's already in the message
                title: `Join our ${itemName} Loop!`
            });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <View className="bg-ui-surface border border-brand-primary/20 rounded-3xl p-6 mt-6 shadow-md">
            <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                    <View className="w-10 h-10 rounded-full bg-brand-primary/10 items-center justify-center border border-brand-primary/30">
                        <Users size={20} color="#5A189A" />
                    </View>
                    <View className="ml-3">
                        <Text className="text-text-primary font-black text-lg uppercase tracking-tight">{itemName} LOOP</Text>
                        <Text className="text-text-secondary text-xs font-bold">STATUS: UNLOCKING {discount} OFF</Text>
                    </View>
                </View>
                <View className="bg-brand-primary px-3 py-1 rounded-full">
                    <Text className="text-white text-[10px] font-black uppercase">{currentMembers}/{neededMembers} JOINED</Text>
                </View>
            </View>

            {/* Progress Bar */}
            <View className="h-4 bg-gray-200 rounded-full overflow-hidden border border-gray-300 mb-2 shadow-inner">
                <View
                    className="h-full bg-brand-secondary rounded-full"
                    style={{ width: `${progress}%` }}
                />
            </View>
            <View className="flex-row justify-between items-center px-1">
                <Text className="text-text-secondary text-[10px] font-bold">START</Text>
                <Text className="text-brand-secondary text-[10px] font-black">{neededMembers - currentMembers} MORE TO UNLOCK</Text>
                <Text className="text-text-secondary text-[10px] font-bold">GOAL</Text>
            </View>

            {/* WhatsApp Sync Button */}
            <TouchableOpacity
                onPress={onShare}
                className="mt-6 bg-[#25D366] py-4 rounded-xl flex-row items-center justify-center shadow-sm"
            >
                <MessageCircle size={20} color="white" fill="white" />
                <Text className="text-white font-black ml-2 uppercase tracking-tight">Invite via WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={onShare}
                className="mt-3 bg-ui-background border border-gray-200 py-3 rounded-xl flex-row items-center justify-center shadow-sm"
            >
                <Share2 size={18} color="#6B7280" />
                <Text className="text-text-secondary font-bold ml-2">Copy Link</Text>
            </TouchableOpacity>
        </View>
    );
};
