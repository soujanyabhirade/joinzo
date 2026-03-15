import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import { ChevronLeft, Users, Zap, Clock, TrendingDown, CheckCircle2, ShoppingBag } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const MOCK_ACTIVE_LOOPS = [
    {
        id: 'l1',
        name: "Organic Whole Milk",
        image: "https://images.unsplash.com/photo-1563636619-e910ef2a844b?w=400&q=80",
        currentMembers: 3,
        targetMembers: 5,
        discount: "30%",
        timeLeft: "12:45",
        status: "Active",
        neighborAvatars: ["👨‍🍳", "👩‍🌾", "👨‍💻"]
    },
    {
        id: 'l2',
        name: "Hass Avocados",
        image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b560?w=400&q=80",
        currentMembers: 8,
        targetMembers: 10,
        discount: "45%",
        timeLeft: "05:12",
        status: "Active",
        neighborAvatars: ["👨‍🎨", "👩‍🚀", "👨‍🚒", "👩‍🏫", "👨‍🔧"]
    }
];

const MOCK_COMPLETED_LOOPS = [
    {
        id: 'l3',
        name: "Artisan Sourdough",
        image: "https://images.unsplash.com/photo-1585478259715-876a23d1ffbb?w=400&q=80",
        currentMembers: 5,
        targetMembers: 5,
        discount: "25%",
        status: "Delivered",
        date: "Today"
    }
];

export const MyLoopsScreen = ({ navigation }: any) => {
    const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

    return (
        <View className="flex-1 bg-ui-background">
            {/* Header */}
            <View className="px-4 py-6 pt-12 flex-row items-center border-b border-gray-100 bg-white shadow-sm z-10">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                    <ChevronLeft size={28} color="#5A189A" />
                </TouchableOpacity>
                <View>
                    <Text className="text-text-primary font-black text-xl uppercase italic tracking-tighter">My Loops</Text>
                    <Text className="text-text-secondary font-bold text-[10px] uppercase tracking-widest">Community Savings Dashboard</Text>
                </View>
            </View>

            {/* Tabs */}
            <View className="flex-row p-4 gap-2">
                <TouchableOpacity 
                    onPress={() => setActiveTab('active')}
                    className={`flex-1 py-3 rounded-2xl items-center border ${activeTab === 'active' ? 'bg-brand-primary border-brand-primary' : 'bg-white border-gray-200'}`}
                >
                    <Text className={`font-black uppercase text-xs ${activeTab === 'active' ? 'text-white' : 'text-text-secondary'}`}>Active</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={() => setActiveTab('completed')}
                    className={`flex-1 py-3 rounded-2xl items-center border ${activeTab === 'completed' ? 'bg-brand-primary border-brand-primary' : 'bg-white border-gray-200'}`}
                >
                    <Text className={`font-black uppercase text-xs ${activeTab === 'completed' ? 'text-white' : 'text-text-secondary'}`}>History</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
                {activeTab === 'active' ? (
                    MOCK_ACTIVE_LOOPS.length > 0 ? (
                        MOCK_ACTIVE_LOOPS.map((loop) => (
                            <View key={loop.id} className="bg-white border border-gray-100 rounded-[32px] p-5 mb-6 shadow-md shadow-brand-primary/5">
                                <View className="flex-row items-center justify-between mb-4">
                                    <View className="flex-row items-center">
                                        <View className="w-12 h-12 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
                                            <Image source={{ uri: loop.image }} className="w-full h-full" resizeMode="cover" />
                                        </View>
                                        <View className="ml-3">
                                            <Text className="text-text-primary font-black text-lg tracking-tight">{loop.name}</Text>
                                            <View className="flex-row items-center">
                                                <Zap size={10} color="#5A189A" />
                                                <Text className="text-brand-primary font-black text-[10px] uppercase ml-1 tracking-widest">{loop.discount} OFF SECURED</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View className="bg-orange-50 px-3 py-1 rounded-full border border-orange-100 flex-row items-center">
                                        <Clock size={10} color="#EA580C" />
                                        <Text className="text-orange-600 font-black text-[10px] ml-1">{loop.timeLeft}</Text>
                                    </View>
                                </View>

                                {/* Progress Bar */}
                                <View className="mb-4">
                                    <View className="flex-row justify-between mb-2">
                                        <Text className="text-text-secondary font-bold text-[10px] uppercase">Neighbors Joined</Text>
                                        <Text className="text-text-primary font-black text-[10px]">{loop.currentMembers}/{loop.targetMembers}</Text>
                                    </View>
                                    <View className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200/50">
                                        <View 
                                            className="h-full bg-brand-primary" 
                                            style={{ width: `${(loop.currentMembers / loop.targetMembers) * 100}%` }} 
                                        />
                                    </View>
                                </View>

                                {/* Members Footer */}
                                <View className="flex-row items-center justify-between mt-2">
                                    <View className="flex-row items-center">
                                        <View className="flex-row -space-x-2">
                                            {loop.neighborAvatars.map((av, i) => (
                                                <View key={i} className="w-7 h-7 rounded-full bg-white border border-gray-200 items-center justify-center shadow-sm">
                                                    <Text className="text-xs">{av}</Text>
                                                </View>
                                            ))}
                                        </View>
                                        <Text className="text-text-secondary font-bold text-[10px] ml-3">+ {loop.targetMembers - loop.currentMembers} more needed</Text>
                                    </View>
                                    <TouchableOpacity 
                                        onPress={() => navigation.navigate('ConnectContacts', { teamName: loop.name })}
                                        className="bg-brand-primary/10 px-4 py-2 rounded-xl flex-row items-center border border-brand-primary/20"
                                    >
                                        <Users size={12} color="#5A189A" />
                                        <Text className="text-brand-primary font-black text-[10px] ml-2 uppercase">Invite</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View className="items-center justify-center py-20">
                            <TrendingDown size={48} color="#9CA3AF" />
                            <Text className="text-text-secondary font-bold mt-4">You have no active loops.</Text>
                            <TouchableOpacity 
                                onPress={() => navigation.navigate('Home')}
                                className="mt-6 bg-brand-primary px-8 py-4 rounded-3xl"
                            >
                                <Text className="text-white font-black">START A LOOP</Text>
                            </TouchableOpacity>
                        </View>
                    )
                ) : (
                    MOCK_COMPLETED_LOOPS.map((loop) => (
                        <View key={loop.id} className="bg-gray-50 border border-gray-100 rounded-[32px] p-5 mb-4 opacity-80 shadow-sm">
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center">
                                    <View className="w-12 h-12 rounded-2xl overflow-hidden bg-white border border-gray-100 grayscale">
                                        <Image source={{ uri: loop.image }} className="w-full h-full" resizeMode="cover" />
                                    </View>
                                    <View className="ml-3">
                                        <Text className="text-text-primary font-bold text-base">{loop.name}</Text>
                                        <View className="flex-row items-center">
                                            <CheckCircle2 size={10} color="#10B981" />
                                            <Text className="text-green-600 font-bold text-[10px] uppercase ml-1 tracking-widest">{loop.status} • SAVE {loop.discount}</Text>
                                        </View>
                                    </View>
                                </View>
                                <Text className="text-text-secondary font-bold text-[10px] uppercase">{loop.date}</Text>
                            </View>
                        </View>
                    ))
                )}
                
                {/* Motivational Banner */}
                <View className="my-8 bg-indigo-50 border border-indigo-100 p-6 rounded-[40px] flex-row items-center">
                    <View className="w-14 h-14 bg-white rounded-2xl items-center justify-center shadow-sm">
                        <ShoppingBag size={28} color="#5A189A" />
                    </View>
                    <View className="ml-4 flex-1">
                        <Text className="text-text-primary font-black text-lg tracking-tight">Looping Tip</Text>
                        <Text className="text-text-secondary font-medium text-xs">Share your loops at your building gate to unlock the max 50% discount tiers faster.</Text>
                    </View>
                </View>

                <View className="h-20" />
            </ScrollView>
        </View>
    );
};
