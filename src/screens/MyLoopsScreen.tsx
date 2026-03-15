import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Dimensions, ActivityIndicator } from 'react-native';
import { ChevronLeft, Users, Zap, Clock, TrendingDown, CheckCircle2, ShoppingBag } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { useTheme } from '../lib/ThemeContext';
import { useNotification } from '../lib/NotificationContext';
import { RiderOrderSkeleton } from '../components/Skeleton';

const { width } = Dimensions.get('window');

interface LoopOrder {
    id: string;
    product_name: string;
    price_at_order: number;
    quantity: number;
    status: string;
    created_at: string;
    type: string;
    image_url?: string;
}

export const MyLoopsScreen = ({ navigation }: any) => {
    const { isDarkMode } = useTheme();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
    const [loops, setLoops] = useState<LoopOrder[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLoops = async () => {
        try {
            const { data, error } = await supabase
                .from('order_items')
                .select(`
                    *,
                    orders!inner(user_id, status)
                `)
                .eq('orders.user_id', user?.id)
                .eq('type', 'Loop')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setLoops(data || []);
        } catch (err) {
            console.error('Fetch loops error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLoops();

        const sub = supabase
            .channel('my-loops')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, () => {
                fetchLoops();
            })
            .subscribe();

        return () => { supabase.removeChannel(sub); };
    }, [user?.id]);

    const activeLoops = loops.filter(l => l.status !== 'delivered' && l.status !== 'cancelled');
    const completedLoops = loops.filter(l => l.status === 'delivered' || l.status === 'cancelled');

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
                    <Text className={`font-black uppercase text-xs ${activeTab === 'active' ? 'text-white' : 'text-text-secondary'}`}>Active ({activeLoops.length})</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={() => setActiveTab('completed')}
                    className={`flex-1 py-3 rounded-2xl items-center border ${activeTab === 'completed' ? 'bg-brand-primary border-brand-primary' : 'bg-white border-gray-200'}`}
                >
                    <Text className={`font-black uppercase text-xs ${activeTab === 'completed' ? 'text-white' : 'text-text-secondary'}`}>History ({completedLoops.length})</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
                {loading ? (
                    <View className="mt-4">
                        {[1, 2, 3].map(i => <RiderOrderSkeleton key={i} />)}
                    </View>
                ) : activeTab === 'active' ? (
                    activeLoops.length > 0 ? (
                        activeLoops.map((loop) => (
                            <View key={loop.id} className="bg-white border border-gray-100 rounded-[32px] p-5 mb-6 shadow-md shadow-brand-primary/5">
                                <View className="flex-row items-center justify-between mb-4">
                                    <View className="flex-row items-center">
                                        <View className="w-12 h-12 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 items-center justify-center">
                                            <ShoppingBag size={24} color="#5A189A" />
                                        </View>
                                        <View className="ml-3">
                                            <Text className="text-text-primary font-black text-lg tracking-tight">{loop.product_name}</Text>
                                            <View className="flex-row items-center">
                                                <Zap size={10} color="#5A189A" />
                                                <Text className="text-brand-primary font-black text-[10px] uppercase ml-1 tracking-widest">20% OFF SECURED</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View className="bg-orange-50 px-3 py-1 rounded-full border border-orange-100 flex-row items-center">
                                        <Clock size={10} color="#EA580C" />
                                        <Text className="text-orange-600 font-black text-[10px] ml-1">Live</Text>
                                    </View>
                                </View>

                                {/* Progress Bar (Mocked for now as we don't have global loop state) */}
                                <View className="mb-4">
                                    <View className="flex-row justify-between mb-2">
                                        <Text className="text-text-secondary font-bold text-[10px] uppercase">Neighbors Joined</Text>
                                        <Text className="text-text-primary font-black text-[10px]">3/5</Text>
                                    </View>
                                    <View className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200/50">
                                        <View 
                                            className="h-full bg-brand-primary" 
                                            style={{ width: `60%` }} 
                                        />
                                    </View>
                                </View>

                                {/* Members Footer */}
                                <View className="flex-row items-center justify-between mt-2">
                                    <View className="flex-row items-center">
                                        <View className="flex-row -space-x-2">
                                            {["👨‍🍳", "👩‍🌾", "👨‍💻"].map((av, i) => (
                                                <View key={i} className="w-7 h-7 rounded-full bg-white border border-gray-200 items-center justify-center shadow-sm">
                                                    <Text className="text-xs">{av}</Text>
                                                </View>
                                            ))}
                                        </View>
                                        <Text className="text-text-secondary font-bold text-[10px] ml-3">+ 2 more needed</Text>
                                    </View>
                                    <TouchableOpacity 
                                        onPress={() => navigation.navigate('ConnectContacts', { teamName: loop.product_name })}
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
                    completedLoops.length > 0 ? (
                        completedLoops.map((loop) => (
                            <View key={loop.id} className="bg-gray-50 border border-gray-100 rounded-[32px] p-5 mb-4 opacity-80 shadow-sm">
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center">
                                        <View className="w-12 h-12 rounded-2xl overflow-hidden bg-white border border-gray-100 items-center justify-center grayscale">
                                            <ShoppingBag size={24} color="#9CA3AF" />
                                        </View>
                                        <View className="ml-3">
                                            <Text className="text-text-primary font-bold text-base">{loop.product_name}</Text>
                                            <View className="flex-row items-center">
                                                <CheckCircle2 size={10} color="#10B981" />
                                                <Text className="text-green-600 font-bold text-[10px] uppercase ml-1 tracking-widest">{loop.status} • SAVE 20%</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <Text className="text-text-secondary font-bold text-[10px] uppercase">{new Date(loop.created_at).toLocaleDateString()}</Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View className="items-center justify-center py-20">
                            <Text className="text-text-secondary font-bold">No history available.</Text>
                        </View>
                    )
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
