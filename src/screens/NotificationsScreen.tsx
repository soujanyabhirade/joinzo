import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Bell, ShoppingBag, Gift, Bike, Star, Zap, Megaphone, Trash2 } from 'lucide-react-native';
import { useTheme } from '../lib/ThemeContext';

interface Notification {
    id: string;
    type: 'order' | 'promo' | 'referral' | 'delivery' | 'review' | 'system';
    title: string;
    message: string;
    time: string;
    read: boolean;
}

const ICON_MAP: Record<string, any> = {
    order: ShoppingBag,
    promo: Megaphone,
    referral: Gift,
    delivery: Bike,
    review: Star,
    system: Zap,
};

const COLOR_MAP: Record<string, string> = {
    order: '#5A189A',
    promo: '#F59E0B',
    referral: '#10B981',
    delivery: '#3B82F6',
    review: '#EF4444',
    system: '#6366F1',
};

const MOCK_NOTIFICATIONS: Notification[] = [
    { id: '1', type: 'order', title: 'Order Confirmed! 🎉', message: 'Your order #a3f7 has been confirmed. Estimated delivery in 10 mins.', time: '2 min ago', read: false },
    { id: '2', type: 'promo', title: '₹50 OFF on your next order!', message: 'Use code JOINZO50 at checkout. Valid till midnight.', time: '15 min ago', read: false },
    { id: '3', type: 'delivery', title: 'Rider is on the way 🛵', message: 'Rahul M. picked up your order and is heading to you.', time: '20 min ago', read: false },
    { id: '4', type: 'referral', title: 'You earned 100 Coins! 🪙', message: 'Your friend Priya joined using your referral code.', time: '1 hour ago', read: true },
    { id: '5', type: 'review', title: 'Rate your last order', message: 'How was your order from yesterday? Tap to share feedback.', time: '3 hours ago', read: true },
    { id: '6', type: 'order', title: 'Order Delivered ✅', message: 'Your order #b8c2 was delivered. Thank you!', time: '5 hours ago', read: true },
    { id: '7', type: 'promo', title: 'Flash Sale: 30% OFF Snacks! 🍿', message: 'All snacks discounted for the next 2 hours. Don\'t miss out!', time: 'Yesterday', read: true },
    { id: '8', type: 'system', title: 'Welcome to Joinzo! 🚀', message: 'You\'ve received 50 welcome coins. Start shopping now!', time: '2 days ago', read: true },
];

export const NotificationsScreen = ({ navigation }: any) => {
    const { isDarkMode } = useTheme();
    const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
    const [refreshing, setRefreshing] = useState(false);

    const bgBase = isDarkMode ? '#0A0A0A' : '#F8F9FA';
    const surfaceBg = isDarkMode ? '#121212' : '#FFFFFF';
    const borderColor = isDarkMode ? 'rgba(255,255,255,0.08)' : '#F3F4F6';
    const textColor = isDarkMode ? '#FFFFFF' : '#1A1A2E';
    const subTextColor = isDarkMode ? '#9CA3AF' : '#6B7280';

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const deleteNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 800);
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: bgBase }}>
            {/* Header */}
            <View style={{ backgroundColor: surfaceBg, borderBottomColor: borderColor, borderBottomWidth: 1 }}
                className="px-6 pt-4 pb-4 flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                        <ChevronLeft size={28} color={isDarkMode ? "#FFF" : "#5A189A"} />
                    </TouchableOpacity>
                    <View>
                        <Text style={{ color: isDarkMode ? '#F59E0B' : '#D97706' }} className="font-black text-[10px] uppercase tracking-widest">Activity</Text>
                        <Text style={{ color: textColor }} className="font-black text-xl tracking-tighter">NOTIFICATIONS</Text>
                    </View>
                </View>
                {unreadCount > 0 && (
                    <TouchableOpacity onPress={markAllRead} className="bg-brand-primary/10 px-3 py-1.5 rounded-full border border-brand-primary/20">
                        <Text className="text-brand-primary font-black text-[10px] uppercase tracking-wider">Mark all read</Text>
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#5A189A" />}>

                {/* Unread Count Banner */}
                {unreadCount > 0 && (
                    <View className="mx-4 mt-4 p-4 rounded-2xl flex-row items-center" style={{ backgroundColor: isDarkMode ? '#1E1B4B' : '#EDE9FE' }}>
                        <Bell size={18} color="#5A189A" />
                        <Text style={{ color: '#5A189A' }} className="font-black text-sm ml-2">{unreadCount} new notification{unreadCount > 1 ? 's' : ''}</Text>
                    </View>
                )}

                {/* Notification Cards */}
                <View className="mx-4 mt-4 mb-8">
                    {notifications.length === 0 ? (
                        <View className="items-center py-20">
                            <Text style={{ fontSize: 48 }}>🔔</Text>
                            <Text style={{ color: textColor }} className="font-black text-lg mt-4">All caught up!</Text>
                            <Text style={{ color: subTextColor }} className="text-sm font-medium mt-1">No notifications right now.</Text>
                        </View>
                    ) : (
                        notifications.map((notif) => {
                            const IconComponent = ICON_MAP[notif.type] || Bell;
                            const iconColor = COLOR_MAP[notif.type] || '#5A189A';
                            return (
                                <View key={notif.id}
                                    className="mb-2 rounded-[20px] overflow-hidden"
                                    style={{
                                        backgroundColor: notif.read ? surfaceBg : (isDarkMode ? '#1A1A3E' : '#F5F3FF'),
                                        borderWidth: 1,
                                        borderColor: notif.read ? borderColor : (isDarkMode ? '#312E81' : '#DDD6FE'),
                                    }}
                                >
                                    <View className="p-4 flex-row">
                                        <View className="w-10 h-10 rounded-2xl items-center justify-center mr-3 border"
                                            style={{ backgroundColor: iconColor + '15', borderColor: iconColor + '30' }}>
                                            <IconComponent size={18} color={iconColor} />
                                        </View>
                                        <View className="flex-1">
                                            <View className="flex-row items-center justify-between">
                                                <Text style={{ color: textColor }} className="font-black text-sm flex-1 mr-2" numberOfLines={1}>{notif.title}</Text>
                                                {!notif.read && <View className="w-2 h-2 rounded-full bg-brand-primary" />}
                                            </View>
                                            <Text style={{ color: subTextColor }} className="text-xs font-medium mt-1 leading-4" numberOfLines={2}>{notif.message}</Text>
                                            <View className="flex-row items-center justify-between mt-2">
                                                <Text style={{ color: subTextColor }} className="text-[10px] font-bold uppercase tracking-wider">{notif.time}</Text>
                                                <TouchableOpacity onPress={() => deleteNotification(notif.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                                    <Trash2 size={12} color={subTextColor} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            );
                        })
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};
