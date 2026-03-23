import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { ChevronLeft, Wallet, PlusCircle, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react-native';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';

export const WalletScreen = ({ navigation }: any) => {
    const { user } = useAuth();
    const [balance, setBalance] = useState<number>(0);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchWalletData = useCallback(async () => {
        if (!user) return;
        try {
            // Fetch Balance
            const { data: walletData, error: walletError } = await supabase
                .from('wallets')
                .select('id, balance')
                .eq('user_id', user.id)
                .single();

            if (walletError && walletError.code !== 'PGRST116') {
                console.error('Wallet fetch error', walletError);
            }

            if (walletData) {
                setBalance(walletData.balance);
                
                // Fetch Transactions
                const { data: txData, error: txError } = await supabase
                    .from('wallet_transactions')
                    .select('*')
                    .eq('wallet_id', walletData.id)
                    .order('created_at', { ascending: false });
                
                if (txData) {
                    setTransactions(txData);
                }
            } else {
                // Wallet doesn't exist yet, so balance is 0
                setBalance(0);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    useEffect(() => {
        fetchWalletData();
    }, [fetchWalletData]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchWalletData();
    };

    const handleAddMoney = async () => {
        // This is a simulation of a Razorpay top-up flow for demonstration
        Alert.alert(
            "Add Money",
            "Simulating adding ₹500 to your wallet via Razorpay...",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Confirm Payment", 
                    onPress: async () => {
                        try {
                            // 1. Get or create wallet
                            let { data: wallet } = await supabase.from('wallets').select('id, balance').eq('user_id', user?.id).single();
                            
                            let walletId = wallet?.id;
                            let walletBalance = wallet?.balance;

                            if (!walletId) {
                                const { data: newWallet, error: newWalletErr } = await supabase.from('wallets').insert({ user_id: user?.id, balance: 0 }).select().single();
                                if (newWalletErr) throw newWalletErr;
                                walletId = newWallet?.id;
                                walletBalance = newWallet?.balance;
                            }

                            if (!walletId) throw new Error("Could not initialize wallet");

                            // 2. Add Transaction
                            const amountToAdd = 500;
                            const { error: txErr } = await supabase.from('wallet_transactions').insert({
                                wallet_id: walletId,
                                amount: amountToAdd,
                                type: 'credit',
                                description: 'Wallet Top Up via Razorpay',
                                reference_id: `topup_${Date.now()}`
                            });

                            if (txErr) throw txErr;

                            // 3. Update Balance
                            const { error: balErr } = await supabase.from('wallets').update({
                                balance: (walletBalance || 0) + amountToAdd,
                                updated_at: new Date().toISOString()
                            }).eq('id', walletId);

                            if (balErr) throw balErr;

                            Alert.alert("Success", "₹500 added to Joinzo Cash!");
                            fetchWalletData();

                        } catch (err: any) {
                            Alert.alert("Error", err.message || "Could not add money");
                        }
                    }
                }
            ]
        );
    };

    return (
        <View className="flex-1 bg-ui-background">
            {/* Header */}
            <View className="px-6 pt-12 pb-6 flex-row items-center border-b border-gray-100 bg-white">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                    <ChevronLeft size={28} color="#5A189A" />
                </TouchableOpacity>
                <Text className="text-text-primary font-black text-2xl tracking-tighter uppercase flex-1">Joinzo Cash</Text>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#5A189A" />
                </View>
            ) : (
                <ScrollView 
                    className="flex-1 p-6" 
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                >
                    {/* Balance Card */}
                    <View className="bg-[#2E1065] rounded-3xl p-6 shadow-xl mb-8 relative overflow-hidden">
                        <View className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500 rounded-full opacity-20" />
                        <View className="absolute -bottom-10 -left-10 w-24 h-24 bg-purple-400 rounded-full opacity-10" />
                        
                        <View className="flex-row items-center mb-4">
                            <Wallet size={24} color="#D8B4FE" />
                            <Text className="text-purple-200 font-bold ml-2 tracking-widest text-xs uppercase">Available Balance</Text>
                        </View>
                        
                        <Text className="text-white font-black text-5xl tracking-tighter mb-6">
                            ₹{balance.toFixed(2)}
                        </Text>

                        <TouchableOpacity 
                            onPress={handleAddMoney}
                            className="bg-white px-4 py-3 rounded-2xl flex-row items-center justify-center self-start shadow-sm"
                            activeOpacity={0.8}
                        >
                            <PlusCircle size={20} color="#5A189A" />
                            <Text className="text-[#5A189A] font-black text-sm uppercase tracking-wider ml-2">Add Money</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Transactions List */}
                    <View className="mb-8">
                        <Text className="text-text-primary font-black text-lg mb-4 ml-1">Recent Transactions</Text>
                        
                        {transactions.length === 0 ? (
                            <View className="bg-white rounded-3xl p-8 border border-gray-100 items-center justify-center mb-6">
                                <Clock size={40} color="#D1D5DB" />
                                <Text className="text-text-secondary font-bold mt-4 text-center">No transactions yet.{"\n"}Top up your wallet to get started!</Text>
                            </View>
                        ) : (
                            transactions.map((tx) => (
                                <View key={tx.id} className="bg-white rounded-3xl p-4 border border-gray-100 mb-3 shadow-sm flex-row items-center">
                                    <View className={`w-12 h-12 rounded-full items-center justify-center ${tx.type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                                        {tx.type === 'credit' ? (
                                            <ArrowDownLeft size={24} color="#16A34A" />
                                        ) : (
                                            <ArrowUpRight size={24} color="#EF4444" />
                                        )}
                                    </View>
                                    <View className="flex-1 ml-4 justify-center">
                                        <Text className="text-text-primary font-bold text-sm">{tx.description || (tx.type === 'credit' ? 'Added to Wallet' : 'Paid for Order')}</Text>
                                        <Text className="text-text-secondary text-[10px] font-bold uppercase mt-1">{new Date(tx.created_at).toLocaleString()}</Text>
                                    </View>
                                    <View className="items-end">
                                        <Text className={`font-black text-lg ${tx.type === 'credit' ? 'text-green-600' : 'text-text-primary'}`}>
                                            {tx.type === 'credit' ? '+' : '-'}₹{Math.abs(tx.amount).toFixed(2)}
                                        </Text>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>
                    <View className="h-20" />
                </ScrollView>
            )}
        </View>
    );
};
