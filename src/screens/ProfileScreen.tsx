import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { useAuth } from '../lib/AuthContext';
import { useCart } from '../lib/CartContext';
import { useLocation } from '../lib/LocationContext';
import { useNotification } from '../lib/NotificationContext';
import { supabase } from '../lib/supabase';
import { useCoins } from '../lib/CoinsContext';
import { User, LogOut, Settings, CreditCard, HelpCircle, ChevronLeft, Package, RotateCw, Heart, MapPin, Trash2, Zap, Store, Bike, Gift, Bell, ClipboardList, Shield } from 'lucide-react-native';

export const ProfileScreen = ({ navigation }: any) => {
    const { user } = useAuth();
    const { addToCart, favorites } = useCart();
    const { savedAddresses, deleteAddress } = useLocation();
    const { showNotification } = useNotification();
    const { coinsBalance } = useCoins();
    const [orders, setOrders] = useState<any[]>([]);
    const [partnerStatus, setPartnerStatus] = useState<string | null>(null);
    const [riderStatus, setRiderStatus] = useState<string | null>(null);
    const [loadingStatus, setLoadingStatus] = useState(true);

    const fetchOrders = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*, order_items(*)')
                .eq('user_id', user?.id)
                .order('created_at', { ascending: false })
                .limit(5);

            if (data) setOrders(data);
        } catch (err) {
            console.log("Could not fetch orders", err);
        }
    }, [user?.id]);

    const fetchStatuses = useCallback(async () => {
        try {
            const { data: partner } = await supabase.from('partners').select('status').eq('user_id', user?.id).single();
            const { data: rider } = await supabase.from('riders').select('status').eq('user_id', user?.id).single();
            if (partner) setPartnerStatus(partner.status);
            if (rider) setRiderStatus(rider.status);
        } catch (err) {
            console.log("Status fetch error:", err);
        } finally {
            setLoadingStatus(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (user) {
            fetchOrders();
            fetchStatuses();
        }
    }, [user, fetchOrders, fetchStatuses]);

    const handleReorder = async (orderId: string) => {
        const order = orders.find(o => o.id === orderId);
        
        if (!order || !order.order_items || order.order_items.length === 0) {
            showNotification("Could not find items to reorder.", "error");
            return;
        }

        order.order_items.forEach((item: any) => {
            addToCart({ 
                id: item.product_id, 
                name: item.product_name, 
                price: item.price_at_order, 
                qty: item.quantity,
                type: "Solo" 
            });
        });

        showNotification(`${order.order_items.length} items added to cart!`, "success");
        navigation.navigate("Checkout");
    };

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            showNotification(error.message, "error");
        } else {
            showNotification("Signed out successfully.", "info");
        }
    };

    return (
        <View className="flex-1 bg-ui-background">
            <View className="px-6 pt-12 pb-6 flex-row items-center border-b border-gray-100 bg-white">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                    <ChevronLeft size={28} color="#5A189A" />
                </TouchableOpacity>
                <Text className="text-text-primary font-black text-2xl tracking-tighter uppercase">My Profile</Text>
            </View>

            <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
                {/* User Info Header */}
                <View className="bg-white rounded-3xl p-6 border border-gray-100 mb-6 shadow-sm flex-row items-center">
                    <View className="w-16 h-16 bg-brand-primary/10 rounded-full items-center justify-center border border-brand-primary/20">
                        <User size={32} color="#5A189A" />
                    </View>
                    <View className="ml-4 flex-1">
                        <Text className="text-text-primary font-black text-xl">{user?.email?.split('@')[0] || 'User'}</Text>
                        <Text className="text-text-secondary text-sm font-medium">{user?.email}</Text>
                    </View>
                </View>

                {/* Sell on Joinzo / Partner Dashboard */}
                <TouchableOpacity
                    onPress={() => {
                        if (partnerStatus === 'verified') navigation.navigate('AdminDashboard');
                        else navigation.navigate('PartnerRegistration');
                    }}
                    className="mb-3 rounded-3xl overflow-hidden shadow-lg"
                    style={{ backgroundColor: '#2E1065' }}
                    activeOpacity={0.85}
                >
                    <View className="p-6 flex-row items-center justify-between">
                        <View className="flex-1 pr-4">
                            <Text className="text-purple-300 font-black text-[10px] uppercase tracking-widest mb-1">🏪 Partner Program</Text>
                            <Text className="text-white font-black text-2xl tracking-tighter">
                                {partnerStatus === 'verified' ? 'Partner Dashboard' : partnerStatus === 'pending' ? 'Verification Pending' : 'Sell on Joinzo'}
                            </Text>
                            <Text className="text-white/70 text-xs font-medium mt-2 leading-5">
                                {partnerStatus === 'verified' ? 'Manage your shop, orders and loop analytics.' : partnerStatus === 'pending' ? 'We are reviewing your shop application. Usually takes 24h.' : 'Register your shop & unlock the power of Loop group buying.'}
                            </Text>
                        </View>
                        <View className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20">
                            <Store size={24} color="#A78BFA" />
                        </View>
                    </View>
                    {partnerStatus === 'verified' && (
                        <View className="bg-white/10 mx-4 mb-4 p-3 rounded-2xl border border-white/10 flex-row items-center justify-center">
                            <Package size={14} color="#A78BFA" />
                            <Text className="text-purple-300 font-black text-xs ml-2 uppercase tracking-wider">Manage Inventory →</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Deliver with Joinzo */}
                <TouchableOpacity
                    onPress={() => {
                        if (riderStatus === 'verified') navigation.navigate('RiderDashboard');
                        else navigation.navigate('RiderRegistration');
                    }}
                    className="mb-6 rounded-3xl overflow-hidden shadow-lg"
                    style={{ backgroundColor: '#064E3B' }}
                    activeOpacity={0.85}
                >
                    <View className="p-6 flex-row items-center justify-between">
                        <View className="flex-1 pr-4">
                            <Text className="text-emerald-300 font-black text-[10px] uppercase tracking-widest mb-1">🛵 Fleet Network</Text>
                            <Text className="text-white font-black text-2xl tracking-tighter">
                                {riderStatus === 'verified' ? 'Rider Dashboard' : riderStatus === 'pending' ? 'Verification Pending' : 'Deliver with Joinzo'}
                            </Text>
                            <Text className="text-white/70 text-xs font-medium mt-2 leading-5">
                                {riderStatus === 'verified' ? 'Manage your deliveries and track your earnings.' : riderStatus === 'pending' ? 'Your profile is under review. Get ready to hit the road!' : 'Earn ₹50 per order + 100% of tips. Weekly payouts.'}
                            </Text>
                        </View>
                        <View className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20">
                            <Bike size={24} color="#6EE7B7" />
                        </View>
                    </View>
                    {riderStatus === 'verified' && (
                        <View className="bg-white/10 mx-4 mb-4 p-3 rounded-2xl border border-white/10 flex-row items-center justify-center">
                            <Bike size={14} color="#6EE7B7" />
                            <Text className="text-emerald-300 font-black text-xs ml-2 uppercase tracking-wider">Rider Dashboard →</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Options List */}
                <View className="bg-white rounded-3xl p-2 border border-gray-100 mb-6 shadow-sm">
                    <TouchableOpacity onPress={() => navigation.navigate('Notifications')} className="flex-row items-center p-4 border-b border-gray-50">
                        <Bell size={20} color="#EF4444" />
                        <Text className="text-text-primary font-bold ml-4 flex-1">Notifications</Text>
                        <View className="bg-red-500 rounded-full w-5 h-5 items-center justify-center">
                            <Text className="text-white font-black text-[9px]">3</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('OrderHistory')} className="flex-row items-center p-4 border-b border-gray-50">
                        <ClipboardList size={20} color="#5A189A" />
                        <Text className="text-text-primary font-bold ml-4 flex-1">Order History</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('MyLoops')} className="flex-row items-center p-4 border-b border-gray-50">
                        <Zap size={20} color="#5A189A" />
                        <Text className="text-text-primary font-bold ml-4 flex-1">My Active Loops</Text>
                        <View className="bg-orange-500 rounded-full w-2 h-2 mr-1" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('Referral')} className="flex-row items-center p-4 border-b border-gray-50">
                        <Gift size={20} color="#F59E0B" />
                        <Text className="text-text-primary font-bold ml-4 flex-1">Joinzo Coins & Referrals</Text>
                        <View className="bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full flex-row items-center">
                            <Text className="text-amber-700 font-black text-xs">🪙 {coinsBalance}</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('PaymentMethods')} className="flex-row items-center p-4 border-b border-gray-50">
                        <CreditCard size={20} color="#5A189A" />
                        <Text className="text-text-primary font-bold ml-4 flex-1">Payment Methods</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('Settings')} className="flex-row items-center p-4 border-b border-gray-50">
                        <Settings size={20} color="#5A189A" />
                        <Text className="text-text-primary font-bold ml-4 flex-1">App Settings</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('AdminDashboard')} className="flex-row items-center p-4 border-b border-gray-50">
                        <Shield size={20} color="#1E1B4B" />
                        <Text className="text-text-primary font-bold ml-4 flex-1">Admin Dashboard</Text>
                        <View className="bg-indigo-900/10 px-2 py-0.5 rounded-full">
                            <Text className="text-indigo-900 font-black text-[9px] uppercase">Admin</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('Support')} className="flex-row items-center p-4">
                        <HelpCircle size={20} color="#5A189A" />
                        <Text className="text-text-primary font-bold ml-4 flex-1">Customer Support</Text>
                    </TouchableOpacity>
                </View>

                {/* Past Orders */}
                <Text className="text-text-primary font-black text-lg mb-4 ml-1">Recent Orders</Text>
                {orders.length === 0 ? (
                    <View className="bg-white rounded-3xl p-8 border border-gray-100 items-center justify-center mb-6">
                        <Package size={40} color="#D1D5DB" />
                        <Text className="text-text-secondary font-bold mt-4">No orders yet</Text>
                    </View>
                ) : (
                    <View className="mb-6">
                        {orders.map((order) => (
                            <View key={order.id} className="bg-white rounded-3xl p-4 border border-gray-100 mb-3 shadow-sm">
                                <View className="flex-row justify-between items-center mb-3">
                                    <View>
                                        <Text className="text-text-primary font-black">Order #{order.id.slice(0,8)}</Text>
                                        <Text className="text-text-secondary text-[10px] uppercase font-bold">{new Date(order.created_at).toLocaleDateString()}</Text>
                                    </View>
                                    <View className="bg-green-100 px-2 py-1 rounded-full">
                                        <Text className="text-green-700 font-black text-[9px] uppercase tracking-widest">{order.status}</Text>
                                    </View>
                                </View>
                                <View className="border-t border-gray-50 pt-3 flex-row justify-between items-center">
                                    <Text className="text-text-primary font-black text-lg">₹{order.total_amount}</Text>
                                    <TouchableOpacity 
                                        onPress={() => handleReorder(order.id)}
                                        className="bg-brand-primary/10 px-4 py-2 rounded-xl border border-brand-primary/20"
                                    >
                                        <Text className="text-brand-primary font-black text-xs uppercase tracking-wider">Reorder</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Sign Out Button */}
                <TouchableOpacity
                    onPress={handleSignOut}
                    className="bg-ui-background border border-red-500 py-4 rounded-xl flex-row items-center justify-center shadow-sm"
                >
                    <LogOut size={20} color="#EF4444" />
                    <Text className="text-red-500 font-bold ml-2">SIGN OUT</Text>
                </TouchableOpacity>

                <Text className="text-center text-gray-500 text-xs mt-6 mb-10">Joinzo v1.0.0</Text>
            </ScrollView>
        </View>
    );
};
