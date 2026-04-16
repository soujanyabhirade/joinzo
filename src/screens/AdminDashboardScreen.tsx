import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Users, Bike, Package, TrendingUp, CheckCircle, XCircle, Clock, IndianRupee, ShoppingBag, Star, Shield, Zap } from 'lucide-react-native';
import { useTheme } from '../lib/ThemeContext';
import { useNotification } from '../lib/NotificationContext';
import { supabase } from '../lib/supabase';

interface Order {
    id: string;
    total_amount: number;
    status: string;
    created_at: string;
    customer_name?: string;
    items_count?: number;
    building_id?: string;
    payment_method?: string;
    delivery_address?: string;
}

export const AdminDashboardScreen = ({ navigation }: any) => {
    const { isDarkMode } = useTheme();
    const { showNotification } = useNotification();
    const [tab, setTab] = useState<'overview' | 'partners' | 'riders' | 'orders' | 'community' | 'inventory'>('overview');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Data
    const [partners, setPartners] = useState<any[]>([]);
    const [riders, setRiders] = useState<any[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, totalPartners: 0, totalRiders: 0, pendingPartners: 0, pendingRiders: 0 });

    const bgBase = isDarkMode ? '#0A0A0A' : '#F8F9FA';
    const surfaceBg = isDarkMode ? '#121212' : '#FFFFFF';
    const borderColor = isDarkMode ? 'rgba(255,255,255,0.08)' : '#F3F4F6';
    const textColor = isDarkMode ? '#FFFFFF' : '#1A1A2E';
    const subTextColor = isDarkMode ? '#9CA3AF' : '#6B7280';

    const fetchAll = useCallback(async () => {
        try {
            // Fetch partners
            const { data: pData } = await supabase.from('partners').select('*').order('created_at', { ascending: false });
            if (pData) setPartners(pData);

            // Fetch riders
            const { data: rData } = await supabase.from('riders').select('*').order('created_at', { ascending: false });
            if (rData) setRiders(rData);

            // Fetch orders
            const { data: oData } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(50);
            if (oData) setOrders(oData);

            // Calculate stats
            setStats({
                totalOrders: oData?.length || 0,
                totalRevenue: oData?.reduce((sum: number, o: any) => sum + (parseFloat(o.total_amount) || 0), 0) || 0,
                totalPartners: pData?.length || 0,
                totalRiders: rData?.length || 0,
                pendingPartners: pData?.filter((p: any) => p.status === 'pending').length || 0,
                pendingRiders: rData?.filter((r: any) => r.status === 'pending').length || 0,
            });
        } catch (err) {
            console.error('Admin fetch error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    useEffect(() => {
        // Real-time subscriptions
        const partnersSub = supabase
            .channel('admin-partners')
            .on('postgres_changes', { event: '*', table: 'partners', schema: 'public' }, () => {
                fetchAll();
            })
            .subscribe();

        const ridersSub = supabase
            .channel('admin-riders')
            .on('postgres_changes', { event: '*', table: 'riders', schema: 'public' }, () => {
                fetchAll();
            })
            .subscribe();

        const ordersSub = supabase
            .channel('admin-orders')
            .on('postgres_changes', { event: '*', table: 'orders', schema: 'public' }, () => {
                fetchAll();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(partnersSub);
            supabase.removeChannel(ridersSub);
            supabase.removeChannel(ordersSub);
        };
    }, [fetchAll]);

    const onRefresh = () => { setRefreshing(true); fetchAll(); };

    const updatePartnerStatus = async (id: string, status: string) => {
        await supabase.from('partners').update({ status }).eq('id', id);
        showNotification(`Partner ${status === 'verified' ? 'approved ✅' : 'rejected ❌'}`, status === 'verified' ? 'success' : 'error');
        fetchAll();
    };

    const updateRiderStatus = async (id: string, status: string) => {
        await supabase.from('riders').update({ status }).eq('id', id);
        showNotification(`Rider ${status === 'verified' ? 'approved ✅' : 'rejected ❌'}`, status === 'verified' ? 'success' : 'error');
        fetchAll();
    };

    const updateOrderStatus = async (id: string, status: string) => {
        await supabase.from('orders').update({ status }).eq('id', id);
        showNotification(`Order updated to: ${status}`, 'success');
        fetchAll();
    };

    const STATUS_BADGE = (status: string) => {
        const colors: Record<string, { bg: string; text: string }> = {
            pending: { bg: '#FEF3C7', text: '#D97706' },
            verified: { bg: '#D1FAE5', text: '#059669' },
            rejected: { bg: '#FEE2E2', text: '#DC2626' },
            placed: { bg: '#DBEAFE', text: '#2563EB' },
            confirmed: { bg: '#D1FAE5', text: '#059669' },
            delivered: { bg: '#A7F3D0', text: '#047857' },
            cancelled: { bg: '#FEE2E2', text: '#DC2626' },
            online: { bg: '#D1FAE5', text: '#059669' },
            offline: { bg: '#F3F4F6', text: '#6B7280' },
        };
        const c = colors[status] || colors.pending;
        return (
            <View style={{ backgroundColor: c.bg }} className="px-2 py-0.5 rounded-full">
                <Text style={{ color: c.text }} className="font-black text-[9px] uppercase tracking-wider">{status}</Text>
            </View>
        );
    };

    const tabs = [
        { key: 'overview', label: '📊 Overview' },
        { key: 'community', label: '🏘️ Communities' },
        { key: 'inventory', label: '📦 Inventory' },
        { key: 'partners', label: `🏪 Partners (${stats.pendingPartners})` },
        { key: 'riders', label: `🛵 Riders (${stats.pendingRiders})` },
    ];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: bgBase }}>
            {/* Header */}
            <View style={{ backgroundColor: '#1E1B4B' }} className="px-6 pt-4 pb-4 flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                        <ChevronLeft size={28} color="#FFF" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-purple-300 font-black text-[10px] uppercase tracking-widest">Admin Panel</Text>
                        <Text className="text-white font-black text-xl tracking-tighter">DASHBOARD</Text>
                    </View>
                </View>
                <View className="bg-white/10 p-2 rounded-2xl border border-white/20">
                    <Shield size={20} color="#A78BFA" />
                </View>
            </View>

            {/* Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
                className="border-b" style={{ borderBottomColor: borderColor, backgroundColor: surfaceBg }}>
                <View className="flex-row px-4 py-2">
                    {tabs.map(t => (
                        <TouchableOpacity key={t.key}
                            onPress={() => setTab(t.key as any)}
                            className="mr-3 px-4 py-2 rounded-full"
                            style={{ backgroundColor: tab === t.key ? '#5A189A' : (isDarkMode ? '#1A1A2E' : '#F3F4F6') }}
                        >
                            <Text style={{ color: tab === t.key ? '#FFF' : subTextColor }} className="font-black text-xs">{t.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#5A189A" />}>

                {loading ? (
                    <View className="py-20 items-center"><ActivityIndicator color="#5A189A" size="large" /></View>
                ) : tab === 'overview' ? (
                    /* ======================== OVERVIEW ======================== */
                    <View className="p-4">
                        {/* Stats Grid */}
                        <View className="flex-row flex-wrap justify-between">
                            {[
                                { label: 'Total Revenue', value: `₹${stats.totalRevenue.toFixed(0)}`, icon: IndianRupee, color: '#10B981', bg: '#064E3B' },
                                { label: 'Total Orders', value: `${stats.totalOrders}`, icon: ShoppingBag, color: '#3B82F6', bg: '#1E3A5F' },
                                { label: 'Partners', value: `${stats.totalPartners}`, icon: Users, color: '#8B5CF6', bg: '#2E1065' },
                                { label: 'Riders', value: `${stats.totalRiders}`, icon: Bike, color: '#F59E0B', bg: '#78350F' },
                            ].map(stat => (
                                <View key={stat.label} className="w-[48%] mb-3 rounded-[24px] p-5" style={{ backgroundColor: stat.bg }}>
                                    <View className="w-10 h-10 bg-white/10 rounded-2xl items-center justify-center mb-3 border border-white/10">
                                        <stat.icon size={20} color={stat.color} />
                                    </View>
                                    <Text className="text-white font-black text-2xl">{stat.value}</Text>
                                    <Text className="text-white/60 font-bold text-[10px] uppercase tracking-wider mt-1">{stat.label}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Pending Approvals Alert */}
                        {(stats.pendingPartners > 0 || stats.pendingRiders > 0) && (
                            <View className="mt-2 p-4 rounded-2xl flex-row items-center" style={{ backgroundColor: '#FEF3C7', borderColor: '#FDE68A', borderWidth: 1 }}>
                                <Clock size={18} color="#D97706" />
                                <Text className="ml-2 text-amber-800 font-bold text-sm flex-1">
                                    {stats.pendingPartners > 0 && `${stats.pendingPartners} partner(s) `}
                                    {stats.pendingPartners > 0 && stats.pendingRiders > 0 && '& '}
                                    {stats.pendingRiders > 0 && `${stats.pendingRiders} rider(s) `}
                                    awaiting approval
                                </Text>
                            </View>
                        )}

                        {/* Recent Orders */}
                        <Text style={{ color: textColor }} className="font-black text-lg mt-6 mb-3">Recent Orders</Text>
                        {orders.length === 0 ? (
                            <View className="p-8 items-center bg-white/5 rounded-3xl border border-white/5">
                                <ShoppingBag size={40} color={subTextColor} />
                                <Text style={{ color: subTextColor }} className="mt-3 font-bold">No orders processed yet</Text>
                            </View>
                        ) : orders.slice(0, 5).map(order => (
                            <View key={order.id} className="mb-2 p-4 rounded-2xl flex-row items-center justify-between" style={{ backgroundColor: surfaceBg, borderWidth: 1, borderColor }}>
                                <View>
                                    <Text style={{ color: textColor }} className="font-black text-sm">#{order.id.slice(0, 8)}</Text>
                                    <Text style={{ color: subTextColor }} className="text-[10px] font-bold mt-0.5">₹{order.total_amount}</Text>
                                </View>
                                {STATUS_BADGE(order.status)}
                            </View>
                        ))}
                    </View>
                ) : tab === 'community' ? (
                    /* ======================== COMMUNITY ANALYTICS ======================== */
                    <View className="p-4">
                        <Text style={{ color: textColor }} className="font-black text-2xl tracking-tighter italic mb-6">COMMUNITY<Text className="text-brand-primary"> PULSE</Text></Text>
                        
                        {[
                            { name: 'Prestige Falcon City', loops: '84%', savings: '₹12,450', growth: '+12%' },
                            { name: 'Brigade Gateway', loops: '72%', savings: '₹8,900', growth: '+5%' },
                            { name: 'Sobha Dream Acres', loops: '91%', savings: '₹22,100', growth: '+18%' },
                        ].map((building) => (
                            <View key={building.name} className="mb-4 p-6 rounded-[32px] border border-brand-primary/10" style={{ backgroundColor: surfaceBg }}>
                                <View className="flex-row items-center justify-between mb-4">
                                    <Text style={{ color: textColor }} className="font-black text-lg">{building.name}</Text>
                                    <View className="bg-emerald-500/10 px-3 py-1 rounded-full">
                                        <Text className="text-emerald-600 font-bold text-[10px]">{building.growth}</Text>
                                    </View>
                                </View>
                                <View className="flex-row justify-between">
                                    <View>
                                        <Text className="text-brand-primary font-black text-2xl">{building.loops}</Text>
                                        <Text style={{ color: subTextColor }} className="font-bold text-[9px] uppercase">Loop Participation</Text>
                                    </View>
                                    <View className="items-end">
                                        <Text style={{ color: textColor }} className="font-black text-2xl">{building.savings}</Text>
                                        <Text style={{ color: subTextColor }} className="font-bold text-[9px] uppercase">Shared Savings</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                ) : tab === 'inventory' ? (
                    /* ======================== INVENTORY MANAGEMENT ======================== */
                    <View className="p-4">
                        <Text style={{ color: textColor }} className="font-black text-2xl tracking-tighter italic mb-6">WH<Text className="text-brand-primary"> INVENTORY</Text></Text>
                        
                        <View className="flex-row gap-2 mb-6">
                            <TouchableOpacity className="bg-brand-primary px-4 py-2 rounded-full">
                                <Text className="text-white font-black text-[10px] uppercase">All Stock</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20">
                                <Text className="text-red-500 font-black text-[10px] uppercase">Low Stock (8)</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/20">
                                <Text className="text-amber-500 font-black text-[10px] uppercase">Expiring (3)</Text>
                            </TouchableOpacity>
                        </View>

                        {[
                            { name: 'Alphonso Mangoes', stock: 42, wh: 'Indiranagar Hub', status: 'Healthy' },
                            { name: 'Nandini GoodLife Milk', stock: 8, wh: 'Indiranagar Hub', status: 'Restock' },
                            { name: 'Avocado (2pcs)', stock: 5, wh: 'Indiranagar Hub', status: 'Expiring' },
                        ].map((item) => (
                            <View key={item.name} className="mb-3 p-5 rounded-[24px] flex-row items-center border border-gray-100" style={{ backgroundColor: surfaceBg }}>
                                <View className="flex-1">
                                    <Text style={{ color: textColor }} className="font-black text-sm">{item.name}</Text>
                                    <Text style={{ color: subTextColor }} className="text-[10px] font-bold mt-1 uppercase">{item.wh}</Text>
                                </View>
                                <View className="items-end">
                                    <Text style={{ color: item.status === 'Restock' ? '#EF4444' : textColor }} className="font-black text-lg">{item.stock}</Text>
                                    <Text className={`font-black text-[9px] uppercase ${item.status === 'Healthy' ? 'text-emerald-500' : 'text-amber-500'}`}>{item.status}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                ) : tab === 'partners' ? (
                    /* ======================== PARTNERS ======================== */
                    <View className="p-4">
                        {partners.length === 0 ? (
                            <View className="items-center py-20 bg-white/5 rounded-[40px] border border-white/5 mt-4">
                                <View className="w-20 h-20 bg-brand-primary/10 rounded-full items-center justify-center mb-4">
                                    <ShoppingBag size={40} color="#5A189A" />
                                </View>
                                <Text style={{ color: textColor }} className="font-black text-xl">No Applications</Text>
                                <Text style={{ color: subTextColor }} className="text-center px-10 mt-2 font-medium">When shops register to join Joinzo, they'll appear here for your approval.</Text>
                            </View>
                        ) : partners.map(partner => (
                            <View key={partner.id} className="mb-3 rounded-[24px] overflow-hidden" style={{ backgroundColor: surfaceBg, borderWidth: 1, borderColor }}>
                                <View className="p-5">
                                    <View className="flex-row items-center justify-between mb-3">
                                        <View>
                                            <Text style={{ color: textColor }} className="font-black text-base">{partner.shop_name}</Text>
                                            <Text style={{ color: subTextColor }} className="text-xs font-medium">{partner.owner_name} • {partner.category}</Text>
                                        </View>
                                        {STATUS_BADGE(partner.status)}
                                    </View>
                                    <View className="p-3 rounded-2xl mb-3" style={{ backgroundColor: isDarkMode ? '#1A1A2E' : '#F9FAFB' }}>
                                        <Text style={{ color: subTextColor }} className="text-xs font-medium">📍 {partner.address}</Text>
                                        <Text style={{ color: subTextColor }} className="text-xs font-medium mt-1">🏛 GST: {partner.gst_number}</Text>
                                        {partner.fssai_number && <Text style={{ color: subTextColor }} className="text-xs font-medium mt-1">🔬 FSSAI: {partner.fssai_number}</Text>}
                                    </View>
                                    {partner.status === 'pending' && (
                                        <View className="flex-row">
                                            <TouchableOpacity
                                                onPress={() => updatePartnerStatus(partner.id, 'verified')}
                                                className="flex-1 mr-2 py-3 rounded-2xl items-center flex-row justify-center"
                                                style={{ backgroundColor: '#10B981' }}
                                            >
                                                <CheckCircle size={16} color="#FFF" />
                                                <Text className="text-white font-black text-xs ml-1.5 uppercase">Approve</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => updatePartnerStatus(partner.id, 'rejected')}
                                                className="flex-1 py-3 rounded-2xl items-center flex-row justify-center"
                                                style={{ backgroundColor: '#EF4444' }}
                                            >
                                                <XCircle size={16} color="#FFF" />
                                                <Text className="text-white font-black text-xs ml-1.5 uppercase">Reject</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                ) : tab === 'riders' ? (
                    /* ======================== RIDERS ======================== */
                    <View className="p-4">
                        {riders.length === 0 ? (
                            <View className="items-center py-20 bg-white/5 rounded-[40px] border border-white/5 mt-4">
                                <View className="w-20 h-20 bg-brand-primary/10 rounded-full items-center justify-center mb-4">
                                    <Zap size={40} color="#5A189A" />
                                </View>
                                <Text style={{ color: textColor }} className="font-black text-xl">Rider Queue Empty</Text>
                                <Text style={{ color: subTextColor }} className="text-center px-10 mt-2 font-medium">New rider registrations will show up here for verification.</Text>
                            </View>
                        ) : riders.map(rider => (
                            <View key={rider.id} className="mb-3 rounded-[24px] overflow-hidden" style={{ backgroundColor: surfaceBg, borderWidth: 1, borderColor }}>
                                <View className="p-5">
                                    <View className="flex-row items-center justify-between mb-3">
                                        <View>
                                            <Text style={{ color: textColor }} className="font-black text-base">{rider.full_name}</Text>
                                            <Text style={{ color: subTextColor }} className="text-xs font-medium">{rider.vehicle_type} • {rider.vehicle_number}</Text>
                                        </View>
                                        {STATUS_BADGE(rider.status)}
                                    </View>
                                    <View className="p-3 rounded-2xl mb-3" style={{ backgroundColor: isDarkMode ? '#1A1A2E' : '#F9FAFB' }}>
                                        <Text style={{ color: subTextColor }} className="text-xs font-medium">📱 {rider.phone}</Text>
                                        <Text style={{ color: subTextColor }} className="text-xs font-medium mt-1">🪪 DL: {rider.dl_number}</Text>
                                        <Text style={{ color: subTextColor }} className="text-xs font-medium mt-1">🆔 Aadhar: {rider.aadhar_number}</Text>
                                    </View>
                                    {rider.status === 'pending' && (
                                        <View className="flex-row">
                                            <TouchableOpacity
                                                onPress={() => updateRiderStatus(rider.id, 'verified')}
                                                className="flex-1 mr-2 py-3 rounded-2xl items-center flex-row justify-center"
                                                style={{ backgroundColor: '#10B981' }}
                                            >
                                                <CheckCircle size={16} color="#FFF" />
                                                <Text className="text-white font-black text-xs ml-1.5 uppercase">Approve</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => updateRiderStatus(rider.id, 'rejected')}
                                                className="flex-1 py-3 rounded-2xl items-center flex-row justify-center"
                                                style={{ backgroundColor: '#EF4444' }}
                                            >
                                                <XCircle size={16} color="#FFF" />
                                                <Text className="text-white font-black text-xs ml-1.5 uppercase">Reject</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                ) : (
                    /* ======================== ORDERS ======================== */
                    <View className="p-4">
                        {orders.length === 0 ? (
                            <View className="items-center py-16">
                                <Text style={{ fontSize: 48 }}>📦</Text>
                                <Text style={{ color: textColor }} className="font-black text-lg mt-4">No orders yet</Text>
                            </View>
                        ) : orders.map(order => (
                            <View key={order.id} className="mb-3 rounded-[24px] overflow-hidden" style={{ backgroundColor: surfaceBg, borderWidth: 1, borderColor }}>
                                <View className="p-5">
                                    <View className="flex-row items-center justify-between mb-3">
                                        <View>
                                            <Text style={{ color: textColor }} className="font-black text-base">#{order.id.slice(0, 8)}</Text>
                                            <Text style={{ color: subTextColor }} className="text-[10px] font-bold">{new Date(order.created_at).toLocaleDateString()}</Text>
                                        </View>
                                        <View className="items-end">
                                            <Text style={{ color: textColor }} className="font-black text-lg">₹{order.total_amount}</Text>
                                            {STATUS_BADGE(order.status)}
                                        </View>
                                    </View>
                                    <View className="p-3 rounded-2xl mb-3" style={{ backgroundColor: isDarkMode ? '#1A1A2E' : '#F9FAFB' }}>
                                        <Text style={{ color: subTextColor }} className="text-xs font-medium">💳 {order.payment_method || 'COD'}</Text>
                                        {order.delivery_address && <Text style={{ color: subTextColor }} className="text-xs font-medium mt-1">📍 {order.delivery_address}</Text>}
                                    </View>

                                    {/* Order Status Actions */}
                                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                            <View className="flex-row">
                                                {['confirmed', 'packed', 'out_for_delivery', 'delivered'].map(status => (
                                                    <TouchableOpacity
                                                        key={status}
                                                        onPress={() => updateOrderStatus(order.id, status)}
                                                        className="mr-2 px-3 py-2 rounded-xl border"
                                                        style={{ borderColor: '#5A189A20', backgroundColor: order.status === status ? '#5A189A' : 'transparent' }}
                                                    >
                                                        <Text style={{ color: order.status === status ? '#FFF' : '#5A189A' }} className="font-bold text-[10px] uppercase">
                                                            {status.replace(/_/g, ' ')}
                                                        </Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        </ScrollView>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                <View className="h-10" />
            </ScrollView>
        </SafeAreaView>
    );
};
