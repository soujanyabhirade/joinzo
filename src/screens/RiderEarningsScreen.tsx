import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, IndianRupee, TrendingUp, Calendar, Wallet } from 'lucide-react-native';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';
import { useTheme } from '../lib/ThemeContext';

export const RiderEarningsScreen = ({ navigation }: any) => {
    const { user } = useAuth();
    const { isDarkMode } = useTheme();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const bgBase = isDarkMode ? '#0A0A0A' : '#F8F9FA';
    const surfaceBg = isDarkMode ? '#121212' : '#FFFFFF';
    const textColor = isDarkMode ? '#FFFFFF' : '#1A1A2E';
    const subTextColor = isDarkMode ? '#9CA3AF' : '#6B7280';

    useEffect(() => {
        const fetchEarnings = async () => {
            if (!user) return;
            try {
                const { data: walletData } = await supabase.from('wallets').select('id').eq('user_id', user.id).single();
                if (walletData) {
                    const { data } = await supabase.from('wallet_transactions')
                        .select('*')
                        .eq('wallet_id', walletData.id)
                        .order('created_at', { ascending: false });
                    
                    if (data) setTransactions(data);
                }
            } catch (err) {
                console.error("Error fetching earnings", err);
            } finally {
                setLoading(false);
            }
        };
        fetchEarnings();
    }, [user]);

    const lifetimeEarnings = transactions.filter(t => t.type === 'credit').reduce((a, b) => a + b.amount, 0);
    
    // Calculate this week's earnings
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklyEarnings = transactions
        .filter(t => t.type === 'credit' && new Date(t.created_at) >= oneWeekAgo)
        .reduce((a, b) => a + b.amount, 0);

    const renderTransaction = ({ item }: any) => (
        <View className="bg-white p-4 rounded-3xl mb-4 border border-gray-100 flex-row items-center shadow-sm">
            <View className="w-14 h-14 bg-emerald-50 rounded-2xl items-center justify-center mr-4 border border-emerald-100/50">
                <IndianRupee size={22} color="#059669" />
            </View>
            <View className="flex-1">
                <Text style={{ color: textColor }} className="font-black text-sm leading-5 mb-1">{item.description || 'Delivery Earnings'}</Text>
                <Text style={{ color: subTextColor }} className="text-xs font-bold">{new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
            </View>
            <View className="items-end pl-2">
                <Text className="text-emerald-500 font-black text-xl italic">+₹{item.amount}</Text>
                <View className="bg-emerald-50 px-2 py-0.5 mt-1 border border-emerald-100 rounded">
                    <Text className="text-emerald-600 font-bold text-[8px] uppercase tracking-widest">Earned</Text>
                </View>
            </View>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: bgBase }}>
                <ActivityIndicator size="large" color="#059669" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: bgBase }}>
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center bg-white shadow-sm z-10">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 w-10 h-10 bg-gray-50 items-center justify-center rounded-xl border border-gray-100">
                    <ChevronLeft size={24} color="#059669" />
                </TouchableOpacity>
                <Text className="text-xl font-black text-emerald-600 tracking-tighter italic uppercase">EARNINGS HISTORY</Text>
            </View>

            {/* Stats Header */}
            <View className="bg-emerald-600 px-6 py-10 rounded-b-[48px] shadow-lg shadow-emerald-500/30">
                <View className="flex-row items-center mb-4">
                    <Wallet size={20} color="#A7F3D0" />
                    <Text className="text-emerald-100 font-black text-xs uppercase tracking-[3px] ml-3">Total Lifetime Payouts</Text>
                </View>
                <Text className="text-white font-black text-6xl italic -ml-1">₹{lifetimeEarnings}</Text>

                <View className="flex-row items-center bg-white/10 p-5 rounded-[24px] mt-8 border border-white/20">
                    <View className="w-10 h-10 rounded-full bg-white/10 items-center justify-center mr-3">
                        <Calendar size={18} color="#D1FAE5" />
                    </View>
                    <Text className="text-emerald-50 font-bold flex-1 uppercase tracking-widest text-[10px]">Earned this week</Text>
                    <Text className="text-white font-black text-2xl italic">₹{weeklyEarnings}</Text>
                </View>
            </View>

            <View className="flex-row items-center px-8 mt-10 mb-6">
                <TrendingUp size={16} color={subTextColor} />
                <Text style={{ color: subTextColor }} className="font-black text-[10px] uppercase tracking-[3px] ml-3">Recent Payouts</Text>
            </View>

            <FlatList
                data={transactions}
                keyExtractor={item => item.id.toString()}
                renderItem={renderTransaction}
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={() => (
                    <View className="items-center justify-center py-10 bg-white mx-6 rounded-3xl border border-gray-100 border-dashed">
                        <View className="w-16 h-16 bg-gray-50 rounded-full items-center justify-center mb-4">
                            <Wallet size={24} color="#9CA3AF" />
                        </View>
                        <Text style={{ color: textColor }} className="font-black text-lg mb-2">No earnings yet</Text>
                        <Text style={{ color: subTextColor }} className="font-medium text-center px-10 text-xs">Start taking deliveries to see your payouts here!</Text>
                    </View>
                )}
            />
        </SafeAreaView>
    );
};
