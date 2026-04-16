import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Home, ListOrdered, BarChart2, Package, Settings, PackageSearch } from 'lucide-react-native';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';
import { useTheme } from '../lib/ThemeContext';

export const PartnerDashboardScreen = ({ navigation }: any) => {
    const { user } = useAuth();
    const { isDarkMode } = useTheme();
    const [activeTab, setActiveTab] = useState('home');
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        
        const fetchOrders = async () => {
            const { data } = await supabase
                .from('orders')
                .select('*')
                .eq('partner_id', user.id)
                .order('created_at', { ascending: false });
            
            if (data) setOrders(data);
            setLoading(false);
        };

        fetchOrders();

        const channel = supabase.channel('partner_orders_ch')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `partner_id=eq.${user.id}` }, payload => {
                fetchOrders(); // Bruteforce refresh for simplicity, keeps all data perfectly sync'd
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [user]);

    // Derived states
    const today = new Date().toISOString().split('T')[0];
    const todaysOrders = orders.filter(o => o.created_at?.startsWith(today));
    const todaysRevenue = todaysOrders.reduce((acc, o) => acc + (o.total_amount || 0), 0);
    const pendingOrders = orders.filter(o => o.status === 'pending');

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    };

    const renderHome = () => (
        <ScrollView className="flex-1 px-4">
            {/* Stats */}
            <View className="flex-row gap-4 mt-6 mb-6">
                <View className="flex-1 bg-brand-primary p-4 rounded-3xl shadow-sm">
                    <Text className="text-white/80 font-bold text-xs uppercase">Today's Revenue</Text>
                    <Text className="text-white font-black text-2xl mt-1">₹{todaysRevenue}</Text>
                </View>
                <View className="flex-1 bg-white border border-gray-100 p-4 rounded-3xl shadow-sm">
                    <Text className="text-text-secondary font-bold text-xs uppercase">Pending Orders</Text>
                    <Text className="text-brand-primary font-black text-2xl mt-1">{pendingOrders.length}</Text>
                </View>
            </View>

            {/* Quick Actions */}
            <View className="flex-row flex-wrap gap-4 mb-8">
                <TouchableOpacity onPress={() => navigation.navigate('PartnerInventory')} className="w-[47%] bg-white p-4 rounded-2xl border border-gray-100 items-center">
                    <Package size={24} color="#5A189A" />
                    <Text className="mt-2 font-bold text-text-primary">Inventory</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveTab('orders')} className="w-[47%] bg-white p-4 rounded-2xl border border-gray-100 items-center">
                    <ListOrdered size={24} color="#5A189A" />
                    <Text className="mt-2 font-bold text-text-primary">Orders</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Home')} className="w-[47%] bg-white p-4 rounded-2xl border border-gray-100 items-center">
                    <Home size={24} color="#5A189A" />
                    <Text className="mt-2 font-bold text-text-primary">Consumer App</Text>
                </TouchableOpacity>
                <TouchableOpacity className="w-[47%] bg-white p-4 rounded-2xl border border-gray-100 items-center">
                    <Settings size={24} color="#5A189A" />
                    <Text className="mt-2 font-bold text-text-primary">Settings</Text>
                </TouchableOpacity>
            </View>

            {/* Incoming Orders Feed */}
            <Text className="font-black text-lg text-text-primary mb-4">Live incoming orders</Text>
            {pendingOrders.map(order => (
                <View key={order.id} className="bg-white p-4 rounded-2xl border border-brand-primary/20 mb-3 shadow-sm border-l-4 border-l-brand-primary">
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="font-bold text-brand-primary text-xs tracking-widest">ORDER #{order.id.slice(0, 8)}</Text>
                        <View className="bg-red-50 border border-red-200 px-2 py-0.5 rounded flex-row items-center">
                            <View className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1 animate-pulse" />
                            <Text className="text-red-700 font-bold text-[9px] uppercase">New</Text>
                        </View>
                    </View>
                    
                    <View className="my-2 p-3 bg-gray-50 rounded-xl">
                        <Text className="text-text-primary font-bold text-sm">₹{order.total_amount} • {order.payment_method}</Text>
                        <Text className="text-text-secondary text-xs mt-1">Delivery to <Text className="font-black text-brand-primary">Gate {order.gate || 'N/A'}</Text></Text>
                    </View>
                    
                    <TouchableOpacity onPress={() => updateOrderStatus(order.id, 'confirmed')} className="mt-2 bg-green-500 py-3 rounded-xl items-center shadow-sm shadow-green-200">
                        <Text className="text-white font-black uppercase tracking-widest">Accept Order</Text>
                    </TouchableOpacity>
                </View>
            ))}
            {pendingOrders.length === 0 && (
                <View className="items-center justify-center p-8 border border-dashed border-gray-200 rounded-3xl mt-4">
                    <PackageSearch size={32} color="#D1D5DB" />
                    <Text className="text-gray-400 font-bold mt-2">All caught up! No pending orders.</Text>
                </View>
            )}
            <View className="h-20" />
        </ScrollView>
    );

    const renderOrders = () => {
        return <PartnerOrdersView orders={orders} updateOrderStatus={updateOrderStatus} />;
    };

    const renderAnalytics = () => {
        return <PartnerAnalyticsView orders={orders} />;
    };

    if (loading) {
        return <SafeAreaView className="flex-1 bg-ui-background items-center justify-center"><ActivityIndicator size="large" color="#5A189A"/></SafeAreaView>;
    }

    return (
        <SafeAreaView className="flex-1 bg-ui-background">
            <View className="px-6 py-4 flex-row items-center border-b border-gray-100 bg-white">
                <Text className="text-xl font-black text-brand-primary uppercase italic tracking-tighter">🏪 Partner Portal</Text>
            </View>
            
            <View className="flex-1 bg-gray-50">
                {activeTab === 'home' && renderHome()}
                {activeTab === 'orders' && renderOrders()}
                {activeTab === 'analytics' && renderAnalytics()}
            </View>

            <View className="flex-row bg-white border-t border-gray-100 pb-8 pt-4 px-6 justify-between shadow-lg">
                <TouchableOpacity onPress={() => setActiveTab('home')} className="items-center flex-1">
                    <Home size={24} color={activeTab === 'home' ? "#5A189A" : "#9CA3AF"} />
                    <Text className={`text-[10px] font-bold mt-1 ${activeTab === 'home' ? 'text-brand-primary' : 'text-gray-400'}`}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveTab('orders')} className="items-center flex-1">
                    <ListOrdered size={24} color={activeTab === 'orders' ? "#5A189A" : "#9CA3AF"} />
                    <Text className={`text-[10px] font-bold mt-1 ${activeTab === 'orders' ? 'text-brand-primary' : 'text-gray-400'}`}>Orders</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveTab('analytics')} className="items-center flex-1">
                    <BarChart2 size={24} color={activeTab === 'analytics' ? "#5A189A" : "#9CA3AF"} />
                    <Text className={`text-[10px] font-bold mt-1 ${activeTab === 'analytics' ? 'text-brand-primary' : 'text-gray-400'}`}>Analytics</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

// Extracted views
const PartnerOrdersView = ({ orders, updateOrderStatus }: any) => {
    const [filter, setFilter] = useState('all');

    const filtered = filter === 'all' ? orders : orders.filter((o: any) => o.status === filter);

    return (
        <View className="flex-1">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="max-h-16 bg-white px-2 shadow-sm z-10 py-2 border-b border-gray-100">
                {['all', 'pending', 'confirmed', 'out_for_delivery', 'delivered'].map(f => (
                    <TouchableOpacity key={f} onPress={() => setFilter(f)} className={`px-5 py-2 mx-1 mt-1 mb-2 rounded-full border ${filter === f ? 'bg-brand-primary border-brand-primary' : 'bg-gray-50 border-gray-200'}`}>
                        <Text className={`font-black text-[10px] tracking-widest uppercase ${filter === f ? 'text-white' : 'text-gray-500'}`}>{f.replace(/_/g, ' ')}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            <FlatList
                contentContainerStyle={{ padding: 16 }}
                data={filtered}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View className="bg-white p-5 rounded-[24px] mb-4 border border-gray-100 shadow-sm">
                        <View className="flex-row justify-between mb-3 border-b border-gray-50 pb-3">
                            <Text className="font-bold text-text-primary text-xs">ORDER #{item.id.slice(0, 8)}</Text>
                            <View className="bg-gray-100 px-2 py-1 rounded">
                                <Text className="text-gray-600 font-black uppercase text-[9px]">{item.status.replace(/_/g, ' ')}</Text>
                            </View>
                        </View>
                        <Text className="text-text-primary font-bold text-lg mb-1">₹{item.total_amount}</Text>
                        <Text className="text-gray-500 text-xs mb-4">{item.payment_method}</Text>
                        
                        {item.status === 'pending' && (
                            <TouchableOpacity onPress={() => updateOrderStatus(item.id, 'confirmed')} className="bg-brand-primary py-3 rounded-xl items-center shadow-sm"><Text className="text-white font-black uppercase tracking-wider text-xs">Confirm Order</Text></TouchableOpacity>
                        )}
                        {item.status === 'confirmed' && (
                            <TouchableOpacity onPress={() => updateOrderStatus(item.id, 'packed')} className="bg-orange-500 py-3 rounded-xl items-center shadow-sm"><Text className="text-white font-black uppercase tracking-wider text-xs">Mark as Packed</Text></TouchableOpacity>
                        )}
                        {item.status === 'packed' && (
                            <TouchableOpacity onPress={() => updateOrderStatus(item.id, 'ready_for_pickup')} className="bg-emerald-500 py-3 rounded-xl items-center shadow-sm"><Text className="text-white font-black uppercase tracking-wider text-xs">Ready for Pickup</Text></TouchableOpacity>
                        )}
                    </View>
                )}
            />
        </View>
    );
};

const PartnerAnalyticsView = ({ orders }: any) => {
    const loopOrders = orders.filter((o: any) => o.order_type === 'loop').length;
    const soloOrders = orders.filter((o: any) => o.order_type === 'solo').length;
    const total = loopOrders + soloOrders || 1;
    const loopPercent = Math.round((loopOrders / total) * 100);

    return (
        <ScrollView className="flex-1 px-4 py-6">
            <View className="bg-brand-primary p-6 rounded-[32px] mb-6 shadow-xl shadow-brand-primary/40">
                <Text className="text-white/70 font-bold uppercase tracking-widest text-[10px] mb-1">Total Lifetime Revenue</Text>
                <Text className="text-4xl font-black text-white italic">₹{orders.reduce((a:any, o:any) => a + (o.total_amount||0), 0)}</Text>
            </View>

            <View className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm mb-6">
                <Text className="font-black uppercase text-xs text-text-primary mb-5 tracking-widest">Order Types Overview</Text>
                <View className="h-4 bg-gray-100 rounded-full flex-row overflow-hidden mb-3">
                    <View style={{ width: `${loopPercent}%` }} className="h-full bg-brand-primary" />
                    <View style={{ width: `${100 - loopPercent}%` }} className="h-full bg-orange-400" />
                </View>
                <View className="flex-row justify-between">
                    <Text className="text-brand-primary font-black text-xs uppercase">{loopPercent}% Loop</Text>
                    <Text className="text-orange-500 font-black text-xs uppercase">{100 - loopPercent}% Solo</Text>
                </View>
            </View>
            
            <View className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <Text className="font-black uppercase text-xs text-text-primary mb-3 tracking-widest text-center">Top Products Analysis</Text>
                <Text className="text-xs text-gray-400 text-center font-medium leading-5">Product-specific analytics required Supabase grouping queries. This will be integrated in phase 3.</Text>
            </View>
        </ScrollView>
    );
};
