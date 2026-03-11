import "../lib/nativewind";
import "../../global.css";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StatusBar, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { MapPin, Zap, ShoppingCart, User, Search, Gift } from 'lucide-react-native';
import { TextInput } from 'react-native';

// Components
import { FuzzySearch } from '../components/FuzzySearch';
import { LoopTicker } from '../components/LoopTicker';
import { ProductCard } from '../components/ProductCard';
import { AI_CartMergePopup } from '../components/AI_CartMergePopup';
import { FlashReplenish } from '../components/FlashReplenish';
import { LoopEngine } from '../components/LoopEngine';
import { CountdownTimer } from '../components/CountdownTimer';
import { SocialTicker } from '../components/SocialTicker';

// Hooks
import { useHapticArrival } from '../hooks/useHapticArrival';

// Supabase
import { supabase } from '../lib/supabase';
import { useCart } from '../lib/CartContext';
import { useLocation } from '../lib/LocationContext';
import { useNotification } from '../lib/NotificationContext';

export default function HomeScreen({ navigation }: any) {
  const [showAI, setShowAI] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { startSimulation } = useHapticArrival();
  const { cartItems } = useCart();
  const { isServicable, activeWarehouse, setUserLocation } = useLocation();
  const { showNotification } = useNotification();

  const categories = useMemo(() => ["All", "Fresh", "Snacks", "Drinks", "Electronics", "Groceries", "Essentials"], []);

  const fetchProducts = useCallback(async (category = activeCategory, query = searchQuery) => {
    setLoading(true);
    try {
      let req = supabase.from('products').select('*');

      if (category !== "All") {
        req = req.eq('category', category);
      }

      if (query.trim() !== "") {
        req = req.ilike('name', `%${query}%`);
      }

      const { data, error } = await req;

      if (error) throw error;

      if (data && data.length > 0) {
        setProducts(data);
        setFilteredProducts(data);
      } else {
        setProducts([]);
        setFilteredProducts([]);
      }
    } catch (err: any) {
      console.error("Error fetching products:", err);
      showNotification("Failed to load products from database.", "error");
    } finally {
      setLoading(false);
    }
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Debounce search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) fetchProducts(activeCategory, searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, activeCategory]);

  const handleCategoryPress = useCallback((cat: string) => {
    setActiveCategory(cat);
    fetchProducts(cat, searchQuery);
  }, [fetchProducts, searchQuery]);

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-ui-background">
        <StatusBar barStyle="dark-content" />

        {/* Header */}
        <View className="px-4 py-3 flex-row items-center justify-between bg-ui-background">
          <View>
            <View className="flex-row items-center">
              <Text className="text-brand-primary font-black text-2xl tracking-tighter mr-2">JOINZO</Text>
              {isServicable && <CountdownTimer minutes={10} />}
            </View>
            <View className="flex-row items-center mt-2">
              <MapPin size={12} color={isServicable ? "#5A189A" : "#EF4444"} />
              <Text className="text-text-secondary text-xs ml-1 font-medium">
                {isServicable ? `From ${activeWarehouse?.name}` : 'Out of delivery zone'}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center space-x-3">
            <TouchableOpacity
              onPress={() => navigation.navigate('Profile')}
              className="w-10 h-10 rounded-full bg-ui-surface items-center justify-center border border-gray-200"
            >
              <User size={20} color="#5A189A" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Checkout')}
              className="w-10 h-10 rounded-full bg-ui-surface items-center justify-center border border-gray-200"
            >
              <ShoppingCart size={20} color="#5A189A" />
              {cartItems.length > 0 && (
                <View className="absolute -top-1 -right-1 bg-brand-primary rounded-full w-4 h-4 items-center justify-center">
                  <Text className="text-[10px] font-black text-white">{cartItems.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {isServicable ? (
          <>
            {/* Sticky Search Bar */}
            <View className="px-4 pb-3 bg-ui-background shadow-sm z-10">
              <View className="flex-row items-center bg-ui-surface border border-gray-200 rounded-2xl px-4 py-3">
                <Search size={20} color="#9CA3AF" />
                <TextInput
                  className="flex-1 ml-3 text-text-primary font-medium"
                  placeholder="Search for 'chips', 'milk', 'bread'..."
                  placeholderTextColor="#9CA3AF"
                  value={searchQuery}
                  onChangeText={handleSearch}
                />
              </View>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

              {/* LIVE ACTIVITY TICKER */}
              <LoopTicker />

              {/* Promotional Banner Mock */}
              <View className="mx-4 mt-2 bg-brand-primary p-5 rounded-3xl flex-row items-center justify-between overflow-hidden shadow-sm">
                <View className="flex-1 pr-4">
                  <View className="flex-row items-center mb-1">
                    <Gift size={16} color="#FFFFFF" />
                    <Text className="text-white font-black text-xs ml-2 uppercase tracking-wider">Welcome Offer</Text>
                  </View>
                  <Text className="text-white font-black text-2xl tracking-tighter mt-1">Free Delivery</Text>
                  <Text className="text-white/80 font-bold text-xs mt-1">On your first 3 orders above ₹199.</Text>
                </View>
                <View className="w-20 h-20 bg-white/20 rounded-full items-center justify-center">
                  <Text className="text-white font-black text-2xl">%</Text>
                </View>
              </View>

              {/* SIMULATION CONTROLS (Demo Only) */}
              <View className="mx-4 mt-6 bg-brand-primary/5 border border-brand-primary/20 p-4 rounded-3xl">
                <Text className="text-brand-primary text-[10px] font-black uppercase mb-3">2026 Tech Demo Controls</Text>
                <View className="flex-row flex-wrap gap-2">
                  <TouchableOpacity onPress={() => setShowAI(true)} className="bg-brand-primary/10 px-3 py-2 rounded-xl border border-brand-primary/20">
                    <Text className="text-brand-primary text-[10px] font-bold">Trigger AI Popup</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={startSimulation} className="bg-brand-primary/10 px-3 py-2 rounded-xl border border-brand-primary/20">
                    <Text className="text-brand-primary text-[10px] font-bold">Simulate Haptic</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => {
                    // Teleport out of 3km radius (e.g., somewhere far away)
                    setUserLocation({ lat: 13.1, lng: 77.6 });
                  }} className="bg-red-500/10 px-3 py-2 rounded-xl border border-red-500/20">
                    <Text className="text-red-500 text-[10px] font-bold">Test Geofence (Fail)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => {
                    // Go back to Koramangala
                    setUserLocation({ lat: 12.9340, lng: 77.6250 });
                  }} className="bg-brand-primary/10 px-3 py-2 rounded-xl border border-brand-primary/20">
                    <Text className="text-brand-primary text-[10px] font-bold">Go To Safe Zone</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* ACTIVE LOOP ENGINE */}
              <View className="px-4">
                <LoopEngine
                  itemName="Organic Whole Milk"
                  currentMembers={2}
                  neededMembers={5}
                  discount="30%"
                />
              </View>

              {/* Category Tabs */}
              <View className="mt-6">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
                  {categories.map((cat) => {
                    const isActive = cat === activeCategory;
                    return (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => handleCategoryPress(cat)}
                        className={`mr-3 px-5 py-2.5 rounded-2xl border ${isActive ? 'bg-brand-primary border-brand-primary' : 'bg-ui-surface border-gray-200'}`}>
                        <Text className={`font-bold text-sm ${isActive ? 'text-white' : 'text-text-primary'}`}>{cat}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Product Grid */}
              <View className="px-4 mt-6 flex-row flex-wrap justify-between">
                {loading ? (
                  <Text className="text-text-secondary font-bold m-4 mx-auto">Loading fresh stock...</Text>
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((p: any) => (
                    <ProductCard
                      key={p.id}
                      id={p.id}
                      name={p.name}
                      priceSolo={p.price_solo}
                      priceLoop={p.price_loop}
                      image={p.image_url}
                      weight={p.weight}
                      isInStock={p.is_in_stock}
                    />
                  ))
                ) : (
                  <Text className="text-text-primary font-bold m-4 mx-auto mt-10 text-center">No products found in this category.</Text>
                )}
                <FlashReplenish itemName="Nitro Cold Brew (V4)" onNotify={() => showNotification("Restock notification set!", "success")} />
              </View>

              <View className="h-32" />
            </ScrollView>

            {/* AI Popup render outside the main scroll view */}
            {showAI && (
              <AI_CartMergePopup
                onAdd={() => { setShowAI(false); showNotification("Marie Biscuits added with 5% discount!", "success"); }}
                onDismiss={() => setShowAI(false)}
              />
            )}
          </>
        ) : (
          <View className="flex-1 items-center justify-center p-6 bg-ui-background">
            <View className="w-24 h-24 bg-red-500/10 rounded-full items-center justify-center mb-6">
              <MapPin size={40} color="#EF4444" />
            </View>
            <Text className="text-text-primary font-black text-2xl text-center mb-2 tracking-tight">Out of Delivery Zone</Text>
            <Text className="text-text-secondary font-bold text-center mb-8 px-4 leading-5">
              We only serve locations within 3km of our dark stores to ensure 10-minute delivery. Your physical location is too far from our active warehouses!
            </Text>

            <View className="bg-brand-primary/5 border border-brand-primary/20 p-4 rounded-3xl w-full">
              <Text className="text-brand-primary text-[10px] font-black uppercase mb-3 text-center">Tech Demo Controls</Text>
              <TouchableOpacity onPress={() => {
                setUserLocation({ lat: 12.9340, lng: 77.6250 });
              }} className="bg-brand-primary py-4 rounded-xl items-center shadow-md">
                <Text className="text-white font-black text-sm uppercase">Teleport to Safe Zone</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Global Social Ticker Overlay */}
        <SocialTicker />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
