import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Zap, ShieldCheck, Clock, Crown, Users } from 'lucide-react-native';
import { useTheme } from '../lib/ThemeContext';

const { width } = Dimensions.get('window');

const BENEFITS = [
    {
        title: 'ZERO Delivery Fee',
        desc: 'Save ₹25 on every single order, solo or loop.',
        icon: Zap,
        color: '#5A189A'
    },
    {
        title: 'Priority Dispatch',
        desc: 'Your orders get picked first by our dark store teams.',
        icon: Clock,
        color: '#EA580C'
    },
    {
        title: 'Exclusive Loop Invites',
        desc: 'Join private high-discount loops for premium brands.',
        icon: Users,
        color: '#10B981'
    }
];

export const JoinzoPlusScreen = ({ navigation }: any) => {
    const { isDarkMode } = useTheme();

    return (
        <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-[#0A0A0A]' : 'bg-[#F9FAFB]'}`}>
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center justify-between">
                <TouchableOpacity onPress={() => navigation.goBack()} className={`w-10 h-10 rounded-full items-center justify-center ${isDarkMode ? 'bg-white/10' : 'bg-white shadow-sm'}`}>
                    <ChevronLeft size={24} color={isDarkMode ? "#FFF" : "#5A189A"} />
                </TouchableOpacity>
                <View className="bg-brand-primary/10 px-4 py-1.5 rounded-full border border-brand-primary/20">
                    <Text className="text-brand-primary font-black text-[10px] uppercase tracking-widest">Premium Member</Text>
                </View>
            </View>

            <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                {/* Hero Card */}
                <View className="bg-brand-primary rounded-[40px] p-8 mt-4 overflow-hidden shadow-2xl shadow-brand-primary/40">
                    <View className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
                    <View className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-10 -mb-10" />
                    
                    <Crown size={48} color="#FFF" fill="rgba(255,255,255,0.2)" />
                    <Text className="text-white font-black text-5xl mt-6 tracking-tighter uppercase italic">JOINZO<Text className="text-white/40">PLUS</Text></Text>
                    <Text className="text-white/80 font-bold text-lg mt-2 italic">Upgrade your neighborhood shopping experience.</Text>
                    
                    <View className="mt-8 bg-black/20 p-4 rounded-3xl border border-white/10">
                        <Text className="text-white font-black text-2xl italic">₹199<Text className="text-sm font-normal text-white/60"> / month</Text></Text>
                    </View>
                </View>

                {/* Benefits */}
                <View className="mt-12">
                    <Text className={`font-black text-[10px] uppercase tracking-widest mb-6 ${isDarkMode ? 'text-gray-500' : 'text-text-secondary'}`}>Member Exclusive Benefits</Text>
                    
                    {BENEFITS.map((benefit, i) => (
                        <View key={i} className={`flex-row items-center p-5 rounded-[32px] mb-4 border ${isDarkMode ? 'bg-[#121212] border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}>
                            <View className="w-12 h-12 rounded-2xl items-center justify-center mr-4" style={{ backgroundColor: `${benefit.color}15` }}>
                                <benefit.icon size={24} color={benefit.color} />
                            </View>
                            <View className="flex-1">
                                <Text className={`font-black text-base ${isDarkMode ? 'text-white' : 'text-text-primary'}`}>{benefit.title}</Text>
                                <Text className={`text-xs mt-1 leading-5 ${isDarkMode ? 'text-gray-400' : 'text-text-secondary'}`}>{benefit.desc}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Savings Calculator Placeholder */}
                <View className={`mt-8 p-8 rounded-[40px] border-2 border-dashed ${isDarkMode ? 'border-brand-primary/20 bg-brand-primary/5' : 'border-brand-primary/10 bg-white'}`}>
                    <Text className={`text-center font-bold text-lg ${isDarkMode ? 'text-white' : 'text-text-primary'}`}>Estimated Monthly Savings</Text>
                    <Text className="text-center font-black text-4xl text-brand-primary mt-2 italic">₹1,250+</Text>
                    <Text className={`text-center text-[10px] mt-2 font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-text-secondary'}`}>Based on 8 orders / month</Text>
                </View>
                
                <View className="h-32" />
            </ScrollView>

            {/* Sticky CTA */}
            <View className={`absolute bottom-0 left-0 right-0 p-6 pt-4 pb-10 ${isDarkMode ? 'bg-[#0A0A0A]/90' : 'bg-white/90'}`} style={{ backdropFilter: 'blur(20px)' } as any}>
                <TouchableOpacity 
                    className="bg-brand-primary w-full py-5 rounded-[24px] items-center justify-center shadow-2xl shadow-brand-primary/60"
                >
                    <Text className="text-white font-black text-lg uppercase italic tracking-wider">Unlock Plus Now</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};
