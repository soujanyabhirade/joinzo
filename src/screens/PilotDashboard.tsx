import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, Gift, Share2, TrendingUp, Trophy, ArrowRight } from 'lucide-react-native';
import { useTheme } from '../lib/ThemeContext';
import { CONFIG } from '../lib/config';
import { useNotification } from '../lib/NotificationContext';

export const PilotDashboard = () => {
    const { isDarkMode } = useTheme();
    const { showNotification } = useNotification();
    
    const handleInvite = async () => {
        try {
            const inviteLink = `${CONFIG.APP_BASE_URL}/precit-falcon-101`;
            const message = `Join our apartment loop on Joinzo! Get ₹100 off your first 10-minute delivery. 🚀\n\nLink: ${inviteLink}`;
            
            await Share.share({
                message: message,
                title: 'Join our Community Loop!'
            });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-[#0A0A0A]' : 'bg-white'}`}>
            <ScrollView className="px-6 pt-8">
                <Text className="text-brand-primary font-black text-xs uppercase tracking-[4px] mb-2 italic">Pilot Phase 1</Text>
                <Text className={`font-black text-4xl tracking-tighter italic ${isDarkMode ? 'text-white' : 'text-text-primary'}`}>
                    COMMUNITY<Text className="text-brand-primary"> AMBASSADOR</Text>
                </Text>

                {/* Scorecard */}
                <View className="bg-brand-primary p-8 rounded-[40px] mt-8 shadow-2xl shadow-brand-primary/40">
                    <View className="flex-row items-center justify-between mb-6">
                        <Trophy size={32} color="#FFF" />
                        <View className="bg-white/20 px-4 py-1 rounded-full">
                            <Text className="text-white font-bold text-[10px] uppercase">Master Rank</Text>
                        </View>
                    </View>
                    <Text className="text-white/60 font-bold text-xs uppercase tracking-widest">Active Loopers In Building</Text>
                    <Text className="text-white font-black text-5xl italic mt-1">124</Text>
                    <View className="flex-row items-center mt-6">
                        <TrendingUp size={16} color="#FFF" />
                        <Text className="text-white font-bold ml-2">Pilot target: 200 neighbors</Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <View className="flex-row gap-4 mt-8">
                    <TouchableOpacity 
                        onPress={handleInvite}
                        className="flex-1 bg-emerald-500 p-6 rounded-[32px] items-center"
                    >
                        <Share2 size={24} color="#FFF" />
                        <Text className="text-white font-black text-xs mt-3 uppercase">Invite Gate</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => showNotification("Full leaderboard launching soon! Keep inviting neighbors.", "info")} className="flex-1 bg-purple-100 dark:bg-white/5 p-6 rounded-[32px] items-center">
                        <Gift size={24} color="#5A189A" />
                        <Text className="text-brand-primary font-black text-xs mt-3 uppercase">Rewards</Text>
                    </TouchableOpacity>
                </View>

                {/* Leaderboard Glimpse */}
                <View className="mt-12 bg-gray-50 dark:bg-white/5 rounded-[40px] p-8 mb-10">
                    <Text className={`font-black text-xl mb-6 ${isDarkMode ? 'text-white' : 'text-text-primary'}`}>Top Loop Builders</Text>
                    {[
                        { name: 'Anjali Sharma', invites: 42, points: '4.2k' },
                        { name: 'Rohan Mehta', invites: 28, points: '3.1k' },
                        { name: 'Suresh K.', invites: 15, points: '1.8k' },
                    ].map((person, i) => (
                        <View key={person.name} className="flex-row items-center justify-between mb-4">
                            <View className="flex-row items-center">
                                <View className="w-8 h-8 rounded-full bg-brand-primary/10 items-center justify-center mr-4">
                                    <Text className="text-brand-primary font-black text-xs">{i+1}</Text>
                                </View>
                                <Text className={`font-bold ${isDarkMode ? 'text-gray-300' : 'text-text-secondary'}`}>{person.name}</Text>
                            </View>
                            <Text className="text-brand-primary font-black">{person.points} pts</Text>
                        </View>
                    ))}
                    <TouchableOpacity onPress={() => showNotification("Full leaderboard launching soon! Keep inviting neighbors.", "info")} className="mt-4 flex-row items-center justify-center">
                        <Text className="text-brand-primary font-black text-xs uppercase tracking-widest">View Full Rankings</Text>
                        <ArrowRight size={14} color="#5A189A" className="ml-2" />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};
