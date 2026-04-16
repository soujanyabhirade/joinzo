import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl, Platform, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, MapPin, Package, Clock, CheckCircle, XCircle, IndianRupee, Bike, Navigation, TrendingUp, Zap, Map } from 'lucide-react-native';
import * as Location from 'expo-location';
import * as Linking from 'expo-linking';
import { useTheme } from '../lib/ThemeContext';
import { useAuth } from '../lib/AuthContext';
import { useNotification } from '../lib/NotificationContext';
import { supabase } from '../lib/supabase';

interface OrderItem {
    id: string;
    order_id: string;
    status: string;
    total_amount: number;
    delivery_address: string;
    created_at: string;
    customer_name?: string;
    items_count?: number;
    building_id?: string;
}

const STATUS_COLORS: Record<string, string> = {
    pending: '#F59E0B',
    confirmed: '#3B82F6',
    packed: '#8B5CF6',
    out_for_delivery: '#10B981',
    delivered: '#059669',
    cancelled: '#EF4444',
};

export const RiderDashboardScreen = ({ navigation }: any) => {
    const { isDarkMode } = useTheme();
    const { user } = useAuth();
    const { showNotification } = useNotification();
    const [availableOrders, setAvailableOrders] = useState<OrderItem[]>([]);
    const [myDeliveries, setMyDeliveries] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    const [tab, setTab] = useState<'available' | 'my'>('available');
    const [incomingOrder, setIncomingOrder] = useState<OrderItem | null>(null);
    const [timer, setTimer] = useState(30);
    const [verifyingOrder, setVerifyingOrder] = useState<OrderItem | null>(null);
    const [otpInput, setOtpInput] = useState('');

    // Earnings stats
    const [todayEarnings, setTodayEarnings] = useState(0);
    const [todayTrips, setTodayTrips] = useState(0);
    const [totalEarnings, setTotalEarnings] = useState(0);

    const bgBase = isDarkMode ? '#0A0A0A' : '#F8F9FA';
    const surfaceBg = isDarkMode ? '#121212' : '#FFFFFF';
    const borderColor = isDarkMode ? 'rgba(255,255,255,0.08)' : '#F3F4F6';
    const textColor = isDarkMode ? '#FFFFFF' : '#1A1A2E';
    const subTextColor = isDarkMode ? '#9CA3AF' : '#6B7280';

    const fetchOrders = useCallback(async () => {
        try {
            // Fetch pending orders (available for pickup)
            const { data: pending } = await supabase
                .from('orders')
                .select('*')
                .in('status', ['confirmed', 'packed'])
                .order('created_at', { ascending: false })
                .limit(15);

            if (pending) {
                setAvailableOrders(pending.map(o => ({
                    ...o,
                    customer_name: `Customer #${o.id?.slice(0, 4)}`,
                    items_count: Math.floor(Math.random() * 8) + 1,
                })));
            }

            // Fetch rider's own deliveries  
            const { data: mine } = await supabase
                .from('orders')
                .select('*')
                .eq('rider_id', user?.id)
                .order('created_at', { ascending: false })
                .limit(20);

            if (mine) {
                setMyDeliveries(mine);
                const today = new Date().toISOString().split('T')[0];
                const todayOrders = mine.filter(o =>
                    o.created_at?.startsWith(today) && o.status === 'delivered'
                );
                setTodayTrips(todayOrders.length);
                setTodayEarnings(todayOrders.length * 35); // ₹35 per delivery
                setTotalEarnings(mine.filter(o => o.status === 'delivered').length * 35);
            }
        } catch (err) {
            console.error('RiderDashboard error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchOrders();

        // Subscribe to realtime order updates
        const channel = supabase
            .channel('rider-orders')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
                fetchOrders();
                const newOrder = payload.new as Record<string, any>;
                if (newOrder && newOrder.status === 'confirmed' && !newOrder.rider_id) {
                    // Set incoming order if it doesn't already have one
                    setIncomingOrder(prev => prev ? prev : newOrder as OrderItem);
                    setTimer(30);
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [fetchOrders]);

    // Location Broadcasting
    useEffect(() => {
        let locationSubscription: any;
        const startTracking = async () => {
            if (Platform.OS === 'web' || !user || !isOnline) return;
            const hasActiveDelivery = myDeliveries.some(o => o.status === 'out_for_delivery');
            if (!hasActiveDelivery) return;

            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;

            locationSubscription = await Location.watchPositionAsync(
                { accuracy: Location.Accuracy.Balanced, timeInterval: 10000, distanceInterval: 10 },
                async (loc) => {
                    if (!user?.id) return;
                    const { data } = await supabase.from('rider_location').select('id').eq('rider_id', user.id).single();
                    if (data) {
                        await supabase.from('rider_location').update({ latitude: loc.coords.latitude, longitude: loc.coords.longitude, updated_at: new Date().toISOString() }).eq('rider_id', user.id);
                    } else {
                        await supabase.from('rider_location').insert({ rider_id: user.id, latitude: loc.coords.latitude, longitude: loc.coords.longitude });
                    }
                }
            );
        };
        startTracking();
        return () => { if (locationSubscription) locationSubscription.remove(); };
    }, [myDeliveries, user, isOnline]);

    useEffect(() => {
        let interval: any;
        if (incomingOrder && timer > 0) {
            interval = setInterval(() => setTimer(t => t - 1), 1000);
        } else if (timer === 0) {
            setIncomingOrder(null);
            setTimer(30);
        }
        return () => clearInterval(interval);
    }, [incomingOrder, timer]);

    const handleAcceptOrder = async (orderId: string) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({
                    status: 'out_for_delivery',
                    rider_id: user?.id,
                })
                .eq('id', orderId);

            if (error) throw error;
            showNotification("Order accepted! Navigate to pick up.", "success");
            setTab('my');
            fetchOrders();
        } catch (err: any) {
            showNotification(err.message || "Failed to accept order", "error");
        }
    };

    const handleCompleteDelivery = async (orderId: string) => {
        try {
            const { error } = await supabase.from('orders').update({ status: 'delivered' }).eq('id', orderId);
            if (error) throw error;
            
            // Native instructions requested adding 35 to wallet
            if (user?.id) {
                await supabase.from('wallet_transactions').insert({
                    wallet_id: user.id,
                    amount: 35,
                    type: 'credit',
                    description: `Delivery fee for order #${orderId.slice(0, 6)}`
                });
                const { data: walletData } = await supabase.from('wallets').select('balance').eq('user_id', user.id).single();
                if (walletData) {
                    await supabase.from('wallets').update({ balance: walletData.balance + 35 }).eq('user_id', user.id);
                } else {
                    await supabase.from('wallets').insert({ user_id: user.id, balance: 35 });
                }
            }

            showNotification("Delivery completed! ₹35 earned 🎉", "success");
            fetchOrders();
        } catch (err: any) {
            showNotification(err.message || "Failed to update", "error");
        }
    };

    const verifyOtpAndDeliver = async () => {
        if (!verifyingOrder) return;
        const expectedOtp = verifyingOrder.id.slice(-4);
        if (otpInput === expectedOtp) {
            await handleCompleteDelivery(verifyingOrder.id);
            setVerifyingOrder(null);
            setOtpInput('');
        } else {
            showNotification("Invalid OTP. Try again.", "error");
        }
    };

    const navigateToAddress = (address: string) => {
        const url = 'https://maps.google.com/?q=' + encodeURIComponent(address);
        if (Platform.OS === 'web') {
            window.open(url, '_blank');
        } else {
            Linking.openURL(url);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    // Demo: generate mock orders if none exist
    const generateDemoOrders = () => {
        const demoOrders: OrderItem[] = [
            { id: 'demo-001', order_id: 'demo-001', status: 'confirmed', total_amount: 245, delivery_address: 'Koramangala 4th Block, Bangalore', created_at: new Date().toISOString(), customer_name: 'Priya S.', items_count: 4 },
            { id: 'demo-002', order_id: 'demo-002', status: 'packed', total_amount: 189, delivery_address: 'HSR Layout Sector 2, Bangalore', created_at: new Date().toISOString(), customer_name: 'Rahul M.', items_count: 2 },
            { id: 'demo-003', order_id: 'demo-003', status: 'confirmed', total_amount: 520, delivery_address: 'Indiranagar 12th Main, Bangalore', created_at: new Date().toISOString(), customer_name: 'Anita K.', items_count: 7 },
            { id: 'demo-004', order_id: 'demo-004', status: 'packed', total_amount: 325, delivery_address: 'JP Nagar 6th Phase, Bangalore', created_at: new Date().toISOString(), customer_name: 'Vikram T.', items_count: 5 },
            { id: 'demo-005', order_id: 'demo-005', status: 'confirmed', total_amount: 150, delivery_address: 'Whitefield Main Road, Bangalore', created_at: new Date().toISOString(), customer_name: 'Sneha R.', items_count: 3 },
        ];
        setAvailableOrders(demoOrders);
        setTodayEarnings(245);
        setTodayTrips(7);
        setTotalEarnings(12350);
        showNotification("Demo orders loaded!", "info");
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
                        <Text style={{ color: isDarkMode ? '#10B981' : '#059669' }} className="font-black text-[10px] uppercase tracking-widest">Rider Hub</Text>
                        <Text style={{ color: textColor }} className="font-black text-xl tracking-tighter">DELIVERIES</Text>
                    </View>
                </View>
                {/* Online/Offline Toggle */}
                <TouchableOpacity
                    onPress={() => { setIsOnline(!isOnline); showNotification(isOnline ? "You are now offline" : "You are now online!", isOnline ? "info" : "success"); }}
                    style={{ backgroundColor: isOnline ? '#10B981' : '#6B7280' }}
                    className="px-4 py-2 rounded-full"
                >
                    <Text className="text-white font-black text-xs">{isOnline ? '● ONLINE' : '○ OFFLINE'}</Text>
                </TouchableOpacity>
            </View>

            {/* NEW INCOMING ORDER MODAL (RIDER EXPERIENCE) */}
            {incomingOrder && (
                <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/80 z-50 items-center justify-center p-8">
                    <View className="bg-white w-full rounded-[40px] p-8 items-center shadow-2xl">
                        <View className="w-20 h-20 bg-emerald-100 rounded-full items-center justify-center mb-6">
                            <Zap size={44} color="#10B981" />
                        </View>
                        <Text className="text-text-primary font-black text-3xl tracking-tighter italic">NEW ORDER!</Text>
                        <Text className="text-brand-primary font-bold text-lg mt-1 italic uppercase tracking-widest">₹35 + Tips</Text>
                        
                        <View className="w-full bg-gray-50 rounded-3xl p-6 mt-8 mb-8 border border-gray-100">
                            <View className="flex-row items-center mb-4">
                                <MapPin size={18} color="#5A189A" />
                                <Text className="text-text-primary font-bold ml-2 flex-1" numberOfLines={1}>{incomingOrder.delivery_address}</Text>
                            </View>
                            <View className="flex-row items-center">
                                <Package size={18} color="#5A189A" />
                                <Text className="text-text-primary font-bold ml-2">{incomingOrder.items_count} items • Clustered</Text>
                            </View>
                        </View>

                        <View className="flex-row w-full gap-4">
                            <TouchableOpacity 
                                onPress={() => { setIncomingOrder(null); setTimer(30); }}
                                className="flex-1 py-5 rounded-[24px] bg-gray-100 items-center"
                            >
                                <Text className="text-gray-500 font-black text-xs uppercase tracking-widest">Reject</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={() => { handleAcceptOrder(incomingOrder.id); setIncomingOrder(null); setTimer(30); }}
                                className="flex-[2] py-5 rounded-[24px] bg-emerald-500 items-center shadow-lg shadow-emerald-500/40"
                            >
                                <Text className="text-white font-black text-lg uppercase italic tracking-wider">Accept ({timer}s)</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}

            {/* OTP VERIFICATION MODAL */}
            <Modal visible={!!verifyingOrder} transparent animationType="fade">
                <View className="flex-1 bg-black/60 items-center justify-center p-6">
                    <View className="bg-white w-full rounded-[32px] p-6 items-center shadow-2xl">
                        <View className="bg-emerald-100 w-16 h-16 rounded-2xl items-center justify-center mb-4">
                            <CheckCircle size={32} color="#10B981" />
                        </View>
                        <Text className="font-black text-xl text-text-primary text-center">Verify Delivery</Text>
                        <Text className="text-gray-500 font-bold text-center mt-2 px-4 leading-5 text-sm mb-6">Ask the customer for their 4-digit order PIN.</Text>
                        
                        <TextInput
                            className="bg-gray-50 border border-gray-200 text-center text-3xl font-black w-full py-4 rounded-2xl tracking-[8px] mb-6 shadow-inner"
                            keyboardType="number-pad"
                            maxLength={4}
                            placeholder="••••"
                            value={otpInput}
                            onChangeText={setOtpInput}
                        />

                        <View className="flex-row gap-3 w-full">
                            <TouchableOpacity onPress={() => { setVerifyingOrder(null); setOtpInput(''); }} className="flex-1 border-2 border-gray-200 py-4 rounded-xl items-center">
                                <Text className="font-bold text-gray-500">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={verifyOtpAndDeliver} className="flex-1 bg-brand-primary py-4 rounded-xl items-center shadow-lg shadow-brand-primary/30">
                                <Text className="font-black text-white px-2">Verify</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#5A189A" />}>

                {/* Earnings Card */}
                <View className="mx-4 mt-4 rounded-[28px] overflow-hidden" style={{ backgroundColor: '#064E3B' }}>
                    <View className="p-6">
                        <Text className="text-emerald-300 font-black text-[10px] uppercase tracking-widest mb-3">⚡ Today's Performance</Text>
                        <View className="flex-row">
                            {[
                                { label: 'Earnings', value: `₹${todayEarnings}`, icon: IndianRupee, color: '#10B981' },
                                { label: 'Trips', value: `${todayTrips}`, icon: Bike, color: '#34D399' },
                                { label: 'Lifetime', value: `₹${totalEarnings}`, icon: TrendingUp, color: '#6EE7B7' },
                            ].map(stat => (
                                <View key={stat.label} className="flex-1 items-center">
                                    <View className="w-10 h-10 bg-white/10 rounded-2xl items-center justify-center mb-2 border border-white/10">
                                        <stat.icon size={18} color={stat.color} />
                                    </View>
                                    <Text className="text-white font-black text-lg">{stat.value}</Text>
                                    <Text className="text-white/60 text-[9px] font-bold uppercase tracking-wide mt-0.5">{stat.label}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Tab Switcher */}
                <View className="mx-4 mt-4 flex-row rounded-2xl overflow-hidden" style={{ backgroundColor: isDarkMode ? '#1A1A2E' : '#F3F4F6' }}>
                    {(['available', 'my'] as const).map(t => (
                        <TouchableOpacity
                            key={t}
                            onPress={() => setTab(t)}
                            className="flex-1 py-3 items-center"
                            style={tab === t ? { backgroundColor: '#5A189A', borderRadius: 16 } : {}}
                        >
                            <Text style={{ color: tab === t ? '#FFF' : subTextColor }} className="font-black text-xs uppercase tracking-wider">
                                {t === 'available' ? `🔥 Available (${availableOrders.length})` : `📦 My Deliveries (${myDeliveries.length})`}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Content */}
                {loading ? (
                    <View className="py-20 items-center"><ActivityIndicator color="#5A189A" size="large" /></View>
                ) : tab === 'available' ? (
                    <>
                        {availableOrders.length === 0 ? (
                            <View className="mx-4 mt-6 items-center py-16 rounded-[40px]" style={{ backgroundColor: surfaceBg, borderColor, borderWidth: 1 }}>
                                <View className="w-20 h-20 bg-emerald-500/10 rounded-full items-center justify-center mb-6">
                                    <Bike size={44} color="#059669" />
                                </View>
                                <Text style={{ color: textColor }} className="font-black text-2xl tracking-tighter">Quiet on the road</Text>
                                <Text style={{ color: subTextColor }} className="text-sm font-bold mt-2 text-center px-12 leading-5 italic">New orders will pop up here in real-time. Stay alert for the next delivery!</Text>
                                <TouchableOpacity onPress={generateDemoOrders} className="mt-8 bg-emerald-600 px-10 py-4 rounded-3xl shadow-lg shadow-emerald-500/20">
                                    <Text className="text-white font-black text-xs uppercase tracking-widest">Load Demo Orders</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View className="mx-4 mt-4">
                                {availableOrders.map((order) => (
                                    <View key={order.id} className="mb-3 rounded-[24px] overflow-hidden" style={{ backgroundColor: surfaceBg, borderColor, borderWidth: 1 }}>
                                        <View className="p-5">
                                            {/* Order Header */}
                                            <View className="flex-row justify-between items-start mb-3">
                                                <View className="flex-1">
                                                    <View className="flex-row items-center">
                                                        <Text style={{ color: textColor }} className="font-black text-base">{order.customer_name}</Text>
                                                        <View className="ml-2 px-2 py-0.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[order.status] + '20' }}>
                                                            <Text style={{ color: STATUS_COLORS[order.status] }} className="font-black text-[9px] uppercase tracking-widest">{order.status}</Text>
                                                        </View>
                                                    </View>
                                                    <View className="flex-row items-center mt-1.5">
                                                        <MapPin size={12} color={subTextColor} />
                                                        <Text style={{ color: subTextColor }} className="text-xs font-medium ml-1 flex-1" numberOfLines={1}>{order.delivery_address}</Text>
                                                    </View>
                                                </View>
                                                <View className="items-end">
                                                    <Text style={{ color: '#10B981' }} className="font-black text-lg">₹{order.total_amount}</Text>
                                                    <Text style={{ color: subTextColor }} className="text-[9px] font-bold uppercase">{order.items_count} items</Text>
                                                </View>
                                            </View>

                                            {/* Earnings Estimate */}
                                            <View className="flex-row items-center p-3 rounded-2xl mb-3" style={{ backgroundColor: isDarkMode ? 'rgba(16,185,129,0.1)' : '#F0FDF4' }}>
                                                <IndianRupee size={14} color="#10B981" />
                                                <Text className="text-green-700 font-black text-xs ml-1">₹35 delivery fee + tips</Text>
                                                <Text className="text-green-500 font-medium text-xs ml-auto">~2.4 km</Text>
                                            </View>

                                            {/* Accept Button */}
                                            <TouchableOpacity
                                                onPress={() => handleAcceptOrder(order.id)}
                                                className="py-3.5 rounded-[20px] items-center flex-row justify-center"
                                                style={{ backgroundColor: '#10B981' }}
                                            >
                                                <CheckCircle size={18} color="#FFF" />
                                                <Text className="text-white font-black text-sm ml-2 uppercase tracking-wider">Accept Order</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}
                    </>
                ) : (
                    <>
                        {myDeliveries.length === 0 ? (
                            <View className="mx-4 mt-6 items-center py-16 rounded-[40px]" style={{ backgroundColor: surfaceBg, borderColor, borderWidth: 1 }}>
                                <View className="w-20 h-20 bg-emerald-500/10 rounded-full items-center justify-center mb-6">
                                    <Package size={44} color="#059669" />
                                </View>
                                <Text style={{ color: textColor }} className="font-black text-2xl tracking-tighter">No Deliveries Yet</Text>
                                <Text style={{ color: subTextColor }} className="text-sm font-bold mt-2 text-center px-12 leading-5">Accept an order from the 'Available' tab to start earning.</Text>
                            </View>
                        ) : (
                            <View className="mx-4 mt-4">
                                {myDeliveries.map((order) => (
                                    <View key={order.id} className="mb-3 rounded-[24px] overflow-hidden" style={{ backgroundColor: surfaceBg, borderColor, borderWidth: 1 }}>
                                        <View className="p-5">
                                            <View className="flex-row justify-between items-center mb-2">
                                                <Text style={{ color: textColor }} className="font-black text-lg">Batch: {order.building_id || 'Main Gate'}</Text>
                                                <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[order.status] + '20' }}>
                                                    <Text style={{ color: STATUS_COLORS[order.status] }} className="font-black text-[9px] uppercase tracking-widest">{order.status}</Text>
                                                </View>
                                            </View>
                                            
                                            {/* Clustered Mini-orders */}
                                            <View className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 mb-4 border border-gray-100">
                                                <View className="flex-row items-center mb-2">
                                                    <Package size={14} color="#5A189A" />
                                                    <Text className="text-brand-primary font-black text-[10px] uppercase ml-2">3 Orders for this Gate</Text>
                                                </View>
                                                <Text style={{ color: textColor }} className="text-xs font-bold">1. Flat 402 • Priya S.</Text>
                                                <Text style={{ color: textColor }} className="text-xs font-bold mt-1">2. Flat 105 • Rahul M.</Text>
                                                <Text style={{ color: textColor }} className="text-xs font-bold mt-1">3. Penthouse 2 • Amit K.</Text>
                                            </View>

                                            <View className="flex-row items-center mb-3">
                                                <MapPin size={12} color={subTextColor} />
                                                <Text style={{ color: subTextColor }} className="text-xs font-medium ml-1 flex-1" numberOfLines={1}>{order.delivery_address || 'Address not available'}</Text>
                                            </View>
                                            
                                            <TouchableOpacity 
                                                className="w-full bg-brand-primary py-4 rounded-2xl flex-row items-center justify-center mb-3"
                                                onPress={() => navigateToAddress(order.delivery_address)}
                                            >
                                                <Navigation size={18} color="#FFF" />
                                                <Text className="text-white font-black text-xs uppercase tracking-widest ml-2">Navigate to Address</Text>
                                            </TouchableOpacity>

                                            <View className="flex-row justify-between items-center">
                                                <Text style={{ color: textColor }} className="font-black text-lg">Total: ₹{order.total_amount}</Text>
                                                {order.status === 'out_for_delivery' && (
                                                    <TouchableOpacity
                                                        onPress={() => setVerifyingOrder(order)}
                                                        className="px-5 py-2.5 rounded-2xl flex-row items-center"
                                                        style={{ backgroundColor: '#059669' }}
                                                    >
                                                        <CheckCircle size={14} color="#FFF" />
                                                        <Text className="text-white font-black text-xs ml-1.5 uppercase">Verify OTP & Deliver</Text>
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}
                    </>
                )}

                <View className="h-10" />
            </ScrollView>
        </SafeAreaView>
    );
};
