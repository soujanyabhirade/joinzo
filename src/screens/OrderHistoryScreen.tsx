import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Package, Clock, CheckCircle, Truck, XCircle, RotateCw, Star, Filter } from 'lucide-react-native';
import { useTheme } from '../lib/ThemeContext';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: any; label: string }> = {
    placed: { color: '#F59E0B', bg: '#FEF3C7', icon: Clock, label: 'Placed' },
    confirmed: { color: '#3B82F6', bg: '#DBEAFE', icon: CheckCircle, label: 'Confirmed' },
    packed: { color: '#8B5CF6', bg: '#EDE9FE', icon: Package, label: 'Packed' },
    out_for_delivery: { color: '#10B981', bg: '#D1FAE5', icon: Truck, label: 'On the Way' },
    delivered: { color: '#059669', bg: '#A7F3D0', icon: CheckCircle, label: 'Delivered' },
    cancelled: { color: '#EF4444', bg: '#FEE2E2', icon: XCircle, label: 'Cancelled' },
};

export const OrderHistoryScreen = ({ navigation }: any) => {
    const { isDarkMode } = useTheme();
    const { user } = useAuth();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<string>('all');

    const bgBase = isDarkMode ? '#0A0A0A' : '#F8F9FA';
    const surfaceBg = isDarkMode ? '#121212' : '#FFFFFF';
    const borderColor = isDarkMode ? 'rgba(255,255,255,0.08)' : '#F3F4F6';
    const textColor = isDarkMode ? '#FFFFFF' : '#1A1A2E';
    const subTextColor = isDarkMode ? '#9CA3AF' : '#6B7280';

    const fetchOrders = useCallback(async () => {
        try {
            let query = supabase
                .from('orders')
                .select('*, order_items(*)')
                .eq('user_id', user?.id)
                .order('created_at', { ascending: false });

            if (filter !== 'all') {
                query = query.eq('status', filter);
            }

            const { data } = await query;
            if (data) setOrders(data);
        } catch (err) {
            console.error('OrderHistory error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user?.id, filter]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const onRefresh = () => { setRefreshing(true); fetchOrders(); };

    const filters = [
        { key: 'all', label: 'All' },
        { key: 'placed', label: 'Active' },
        { key: 'delivered', label: 'Delivered' },
        { key: 'cancelled', label: 'Cancelled' },
    ];

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const formatTime = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: bgBase }}>
            {/* Header */}
            <View style={{ backgroundColor: surfaceBg, borderBottomColor: borderColor, borderBottomWidth: 1 }}
                className="px-6 pt-4 pb-4 flex-row items-center">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                    <ChevronLeft size={28} color={isDarkMode ? "#FFF" : "#5A189A"} />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text style={{ color: isDarkMode ? '#A78BFA' : '#5A189A' }} className="font-black text-[10px] uppercase tracking-widest">History</Text>
                    <Text style={{ color: textColor }} className="font-black text-xl tracking-tighter">MY ORDERS</Text>
                </View>
                <View className="bg-brand-primary/10 px-3 py-1 rounded-full border border-brand-primary/20">
                    <Text className="text-brand-primary font-black text-xs">{orders.length} orders</Text>
                </View>
            </View>

            {/* Filter Tabs */}
            <View className="px-4 pt-4 pb-2 flex-row">
                {filters.map(f => (
                    <TouchableOpacity
                        key={f.key}
                        onPress={() => { setFilter(f.key); setLoading(true); }}
                        className="mr-2 px-4 py-2 rounded-full"
                        style={{
                            backgroundColor: filter === f.key ? '#5A189A' : (isDarkMode ? '#1A1A2E' : '#F3F4F6'),
                            borderWidth: 1,
                            borderColor: filter === f.key ? '#5A189A' : borderColor,
                        }}
                    >
                        <Text style={{ color: filter === f.key ? '#FFF' : subTextColor }} className="font-black text-xs">{f.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#5A189A" />}>

                {loading ? (
                    <View className="py-20 items-center"><ActivityIndicator color="#5A189A" size="large" /></View>
                ) : orders.length === 0 ? (
                    <View className="items-center py-20 mx-4">
                        <Text style={{ fontSize: 56 }}>📦</Text>
                        <Text style={{ color: textColor }} className="font-black text-xl mt-4">No orders found</Text>
                        <Text style={{ color: subTextColor }} className="text-sm font-medium mt-2 text-center">
                            {filter !== 'all' ? 'No orders match this filter.' : 'Start shopping to see your orders here!'}
                        </Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Home')}
                            className="mt-6 px-8 py-3 rounded-2xl"
                            style={{ backgroundColor: '#5A189A' }}
                        >
                            <Text className="text-white font-black text-sm uppercase tracking-wider">Start Shopping</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="mx-4 mt-2 mb-8">
                        {orders.map(order => {
                            const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.placed;
                            const StatusIcon = statusInfo.icon;
                            const itemCount = order.order_items?.length || 0;

                            return (
                                <TouchableOpacity
                                    key={order.id}
                                    onPress={() => navigation.navigate('TrackOrder', { orderId: order.id })}
                                    className="mb-3 rounded-[24px] overflow-hidden"
                                    style={{ backgroundColor: surfaceBg, borderWidth: 1, borderColor }}
                                    activeOpacity={0.8}
                                >
                                    <View className="p-5">
                                        {/* Header */}
                                        <View className="flex-row items-center justify-between mb-3">
                                            <View className="flex-row items-center">
                                                <Text style={{ color: textColor }} className="font-black text-base">#{order.id.slice(0, 8)}</Text>
                                            </View>
                                            <View className="flex-row items-center px-2.5 py-1 rounded-full" style={{ backgroundColor: statusInfo.bg }}>
                                                <StatusIcon size={12} color={statusInfo.color} />
                                                <Text style={{ color: statusInfo.color }} className="font-black text-[10px] ml-1 uppercase tracking-wider">{statusInfo.label}</Text>
                                            </View>
                                        </View>

                                        {/* Items Preview */}
                                        {order.order_items && order.order_items.length > 0 && (
                                            <View className="mb-3 p-3 rounded-2xl" style={{ backgroundColor: isDarkMode ? '#1A1A2E' : '#F9FAFB' }}>
                                                {order.order_items.slice(0, 3).map((item: any, i: number) => (
                                                    <View key={i} className={`flex-row items-center justify-between ${i > 0 ? 'mt-1.5' : ''}`}>
                                                        <Text style={{ color: textColor }} className="text-xs font-bold flex-1" numberOfLines={1}>
                                                            {item.quantity}x {item.product_name}
                                                        </Text>
                                                        <Text style={{ color: subTextColor }} className="text-xs font-bold ml-2">₹{item.price_at_order}</Text>
                                                    </View>
                                                ))}
                                                {order.order_items.length > 3 && (
                                                    <Text style={{ color: subTextColor }} className="text-[10px] font-bold mt-1">+{order.order_items.length - 3} more items</Text>
                                                )}
                                            </View>
                                        )}

                                        {/* Footer */}
                                        <View className="flex-row items-center justify-between">
                                            <View>
                                                <Text style={{ color: subTextColor }} className="text-[10px] font-bold uppercase tracking-wider">
                                                    {formatDate(order.created_at)} • {formatTime(order.created_at)}
                                                </Text>
                                                <Text style={{ color: subTextColor }} className="text-[10px] font-medium mt-0.5">
                                                    {itemCount} item{itemCount !== 1 ? 's' : ''} • {order.payment_method || 'COD'}
                                                </Text>
                                            </View>
                                            <View className="items-end">
                                                <Text style={{ color: textColor }} className="font-black text-lg">₹{order.total_amount}</Text>
                                                {order.status === 'delivered' && (
                                                    <TouchableOpacity
                                                        onPress={() => navigation.navigate('RateOrder', { orderId: order.id })}
                                                        className="flex-row items-center mt-1"
                                                    >
                                                        <Star size={10} color="#F59E0B" />
                                                        <Text className="text-amber-600 font-black text-[10px] ml-1">Rate</Text>
                                                    </TouchableOpacity>
                                                )}
                                                {(order.status === 'placed' || order.status === 'confirmed') && (
                                                    <TouchableOpacity className="flex-row items-center mt-1">
                                                        <RotateCw size={10} color="#5A189A" />
                                                        <Text className="text-brand-primary font-black text-[10px] ml-1">Track</Text>
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};
