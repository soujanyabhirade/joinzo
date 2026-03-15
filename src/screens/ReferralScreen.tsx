import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Share, Platform, ActivityIndicator, Clipboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Gift, Copy, Share2, Coins, ArrowUpRight, ArrowDownLeft, Zap, Star, Users } from 'lucide-react-native';
import { useCoins } from '../lib/CoinsContext';
import { useTheme } from '../lib/ThemeContext';
import { useNotification } from '../lib/NotificationContext';

const COIN_TO_RUPEE = 1; // 1 coin = ₹1

const LedgerIcon = ({ type }: { type: string }) => {
    if (type.includes('earn') || type === 'bonus') return <ArrowDownLeft size={16} color="#10B981" />;
    return <ArrowUpRight size={16} color="#EF4444" />;
};

const LedgerTypeLabel: Record<string, string> = {
    earn_referral: 'Referral Bonus',
    earn_order: 'Order Reward',
    spend_checkout: 'Redeemed at Checkout',
    bonus: 'Welcome Bonus',
};

export const ReferralScreen = ({ navigation }: any) => {
    const { coinsBalance, referralCode, ledger, loading } = useCoins();
    const { isDarkMode } = useTheme();
    const { showNotification } = useNotification();
    const [sharing, setSharing] = useState(false);

    const bgBase = isDarkMode ? '#0A0A0A' : '#F8F9FA';
    const surfaceBg = isDarkMode ? '#121212' : '#FFFFFF';
    const borderColor = isDarkMode ? 'rgba(255,255,255,0.1)' : '#F3F4F6';
    const textColor = isDarkMode ? '#FFFFFF' : '#1A1A2E';
    const subTextColor = isDarkMode ? '#9CA3AF' : '#6B7280';

    const shareMessage = `🎉 Join me on Joinzo — India's Group Buying delivery app!\nUse my referral code *${referralCode}* and get ₹50 in Joinzo Coins FREE!\n\n📲 Download now: https://joinzo.app/ref/${referralCode}`;

    const handleShare = async () => {
        setSharing(true);
        try {
            if (Platform.OS === 'web') {
                if (navigator.share) {
                    await navigator.share({ title: 'Join Joinzo!', text: shareMessage });
                } else {
                    await navigator.clipboard.writeText(shareMessage);
                    showNotification("Referral message copied to clipboard!", "success");
                }
            } else {
                await Share.share({ message: shareMessage });
            }
        } catch (err) {
            console.log(err);
        } finally {
            setSharing(false);
        }
    };

    const handleCopyCode = async () => {
        if (Platform.OS === 'web') {
            await navigator.clipboard.writeText(referralCode || '');
        } else {
            Clipboard.setString(referralCode || '');
        }
        showNotification("Referral code copied!", "success");
    };

    const rupeeValue = Math.floor(coinsBalance * COIN_TO_RUPEE);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: bgBase }}>
            {/* Header */}
            <View style={{ backgroundColor: surfaceBg, borderBottomColor: borderColor, borderBottomWidth: 1 }}
                className="px-6 pt-4 pb-4 flex-row items-center">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                    <ChevronLeft size={28} color={isDarkMode ? "#FFF" : "#5A189A"} />
                </TouchableOpacity>
                <View>
                    <Text style={{ color: isDarkMode ? '#A78BFA' : '#5A189A' }} className="font-black text-[10px] uppercase tracking-widest">Rewards</Text>
                    <Text style={{ color: textColor }} className="font-black text-xl tracking-tighter">JOINZO COINS</Text>
                </View>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Coin Balance Hero Card */}
                <View className="mx-4 mt-6 rounded-[32px] overflow-hidden" style={{ backgroundColor: '#2E1065' }}>
                    <View className="absolute inset-0 opacity-20">
                        <View className="absolute top-4 right-8 w-32 h-32 bg-white rounded-full" />
                        <View className="absolute bottom-4 left-4 w-20 h-20 bg-purple-300 rounded-full" />
                    </View>
                    <View className="p-8">
                        <Text className="text-purple-300 font-black text-[10px] uppercase tracking-widest mb-4">⚡ Your Balance</Text>
                        <View className="flex-row items-end">
                            <Text className="text-white font-black" style={{ fontSize: 56, lineHeight: 60 }}>{coinsBalance}</Text>
                            <Text className="text-purple-300 font-black text-xl mb-3 ml-2">coins</Text>
                        </View>
                        <Text className="text-white/70 font-bold mt-1">= ₹{rupeeValue} cashback at checkout</Text>
                        
                        <View className="flex-row gap-3 mt-6">
                            {[
                                { label: '50 Coins', sub: 'Welcome gift', icon: Star },
                                { label: '100 Coins', sub: 'Per referral', icon: Users },
                                { label: '₹1 = 1 Coin', sub: 'Redemption rate', icon: Zap },
                            ].map(item => (
                                <View key={item.label} className="flex-1 bg-white/10 rounded-2xl p-3 border border-white/10">
                                    <item.icon size={14} color="#A78BFA" />
                                    <Text className="text-white font-black text-sm mt-1">{item.label}</Text>
                                    <Text className="text-white/60 text-[9px] font-bold uppercase tracking-wide mt-0.5">{item.sub}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Referral Code Card */}
                <View className="mx-4 mt-4" style={{ backgroundColor: surfaceBg, borderColor, borderWidth: 1, borderRadius: 24 }}>
                    <View className="p-6">
                        <View className="flex-row items-center mb-4">
                            <Gift size={20} color="#5A189A" />
                            <Text style={{ color: textColor }} className="font-black text-base ml-2">Your Referral Code</Text>
                        </View>
                        <Text style={{ color: subTextColor }} className="text-xs font-medium mb-4 leading-5">
                            Share this code with friends. When they sign up and place their first order, you both get <Text className="font-black text-green-600">100 Joinzo Coins (₹100)</Text>!
                        </Text>

                        {/* Code Box */}
                        <TouchableOpacity onPress={handleCopyCode}
                            className="flex-row items-center justify-between p-4 rounded-2xl border border-dashed border-brand-primary"
                            style={{ backgroundColor: isDarkMode ? 'rgba(90,24,154,0.1)' : '#F5F3FF' }}
                        >
                            <Text className="text-brand-primary font-black text-2xl tracking-[8px]">
                                {loading ? '...' : referralCode}
                            </Text>
                            <View className="bg-brand-primary/10 p-2 rounded-xl border border-brand-primary/20">
                                <Copy size={18} color="#5A189A" />
                            </View>
                        </TouchableOpacity>

                        {/* Share Button */}
                        <TouchableOpacity onPress={handleShare} disabled={sharing}
                            className="mt-4 py-4 rounded-[24px] flex-row items-center justify-center"
                            style={{ backgroundColor: sharing ? '#9CA3AF' : '#5A189A' }}
                        >
                            <Share2 size={18} color="#FFF" />
                            <Text className="text-white font-black text-base ml-2 uppercase tracking-wide">
                                {sharing ? 'Sharing...' : 'Share & Earn ₹100'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* How It Works */}
                <View className="mx-4 mt-4 mb-4" style={{ backgroundColor: surfaceBg, borderColor, borderWidth: 1, borderRadius: 24 }}>
                    <View className="p-6">
                        <Text style={{ color: textColor }} className="font-black text-base mb-5">How to Earn More Coins</Text>
                        {[
                            { emoji: '🎁', title: 'Welcome Bonus', desc: '50 Coins just for joining Joinzo!', coins: '+50' },
                            { emoji: '👫', title: 'Invite Friends', desc: 'Get 100 coins when a friend places their first order', coins: '+100' },
                            { emoji: '🛒', title: 'Every Order', desc: 'Earn 5 Coins per ₹100 spent', coins: '+5/₹100' },
                            { emoji: '🔁', title: 'Loop Orders', desc: '2x Coins on group-buy orders', coins: '×2' },
                        ].map((item, i) => (
                            <View key={item.title}>
                                {i > 0 && <View style={{ height: 1, backgroundColor: borderColor, marginVertical: 12 }} />}
                                <View className="flex-row items-center">
                                    <Text style={{ fontSize: 28 }}>{item.emoji}</Text>
                                    <View className="flex-1 ml-4">
                                        <Text style={{ color: textColor }} className="font-black">{item.title}</Text>
                                        <Text style={{ color: subTextColor }} className="text-xs font-medium mt-0.5">{item.desc}</Text>
                                    </View>
                                    <View className="bg-green-100 px-3 py-1 rounded-full border border-green-200">
                                        <Text className="text-green-700 font-black text-xs">{item.coins}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Coins History */}
                <View className="mx-4 mb-8" style={{ backgroundColor: surfaceBg, borderColor, borderWidth: 1, borderRadius: 24 }}>
                    <View className="p-6">
                        <Text style={{ color: textColor }} className="font-black text-base mb-4">Transaction History</Text>
                        {loading ? (
                            <ActivityIndicator color="#5A189A" />
                        ) : ledger.length === 0 ? (
                            <View className="items-center py-6">
                                <Text style={{ fontSize: 36 }}>🪙</Text>
                                <Text style={{ color: subTextColor }} className="font-bold text-center mt-3">
                                    No transactions yet.{'\n'}Start earning coins!
                                </Text>
                            </View>
                        ) : (
                            ledger.map((entry, i) => (
                                <View key={entry.id}>
                                    {i > 0 && <View style={{ height: 1, backgroundColor: borderColor, marginVertical: 10 }} />}
                                    <View className="flex-row items-center">
                                        <View style={{ backgroundColor: entry.amount > 0 ? '#F0FDF4' : '#FEF2F2' }}
                                            className="w-10 h-10 rounded-2xl items-center justify-center mr-3">
                                            <LedgerIcon type={entry.type} />
                                        </View>
                                        <View className="flex-1">
                                            <Text style={{ color: textColor }} className="font-bold text-sm">
                                                {LedgerTypeLabel[entry.type] || entry.type}
                                            </Text>
                                            <Text style={{ color: subTextColor }} className="text-xs mt-0.5">
                                                {entry.description}
                                            </Text>
                                        </View>
                                        <Text className={`font-black text-base ${entry.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                            {entry.amount > 0 ? '+' : ''}{entry.amount}
                                        </Text>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};
