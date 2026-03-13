import "../lib/nativewind";
import "../../global.css";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StatusBar, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { MapPin, Zap, ShoppingCart, User, Search, Gift, PackageOpen, Sparkles, Compass, Flame, Sun, Moon, MessageSquare } from 'lucide-react-native';
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
import { RecipeSection } from '../components/RecipeSection';
import { PriceDropRoulette } from '../components/PriceDropRoulette';
import { RoutineSection } from '../components/RoutineSection';
import { CarbonTicker } from '../components/CarbonTicker';
import { FlashMobDiscount } from '../components/FlashMobDiscount';
import { AIRoutineBuilder } from '../components/AIRoutineBuilder';


// Hooks
import { useHapticArrival } from '../hooks/useHapticArrival';

// Supabase
import { supabase } from '../lib/supabase';
import { useCart } from '../lib/CartContext';
import { useLocation } from '../lib/LocationContext';
import { useNotification } from '../lib/NotificationContext';

const MOCK_PRODUCTS = [
    { id: 'm1', name: "Alphonso Mangoes (1kg)", price: 499, priceLoop: 399, image: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=800", category: "Fresh", isLoopAvailable: true, is_in_stock: true },
    { id: 'm2', name: "Greek Yogurt (500g)", price: 120, priceLoop: 85, image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=800", category: "Dairy", isLoopAvailable: true, is_in_stock: true },
    { id: 'm3', name: "Oreo Family Pack", price: 150, priceLoop: 110, image: "https://images.unsplash.com/photo-1623934199716-bc3449511873?auto=format&fit=crop&q=80&w=800", category: "Snacks", isLoopAvailable: true, is_in_stock: true },
    { id: 'm4', name: "Classic Coca-Cola (2L)", price: 95, priceLoop: 75, image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=800", category: "Drinks", isLoopAvailable: true, is_in_stock: true },
    { id: 'm5', name: "Farm Fresh Spinach", price: 60, priceLoop: 45, image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80&w=800", category: "Fresh", isLoopAvailable: true, is_in_stock: true },
    { id: 'm6', name: "Digestive Biscuits", price: 40, priceLoop: 32, image: "https://images.unsplash.com/photo-1610450949065-1f280fa7c96c?auto=format&fit=crop&q=80&w=800", category: "Snacks", isLoopAvailable: true, is_in_stock: true }
];

export default function HomeScreen({ navigation }: any) {
  const [showAI, setShowAI] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { startSimulation } = useHapticArrival();
  const { cartItems, addToCart } = useCart();
  const { isServicable, activeWarehouse, setUserLocation } = useLocation();
  const { showNotification } = useNotification();
  
  // Dynamic Time-of-Day logic
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  const isNight = currentHour >= 18 || currentHour < 5; // 6 PM to 4:59 AM is Night
  
  // Dynamic themes based on time
  const theme = {
      bg: 'bg-white', // Forced White Background
      surface: 'bg-white', // Forced White Surface
      textPrimary: isNight ? 'text-gray-900' : 'text-text-primary',
      textSecondary: isNight ? 'text-gray-600' : 'text-text-secondary',
      border: isNight ? 'border-gray-200' : 'border-gray-200',
      greetingPill: isNight ? 'bg-indigo-100 border-indigo-200' : 'bg-orange-100 border-orange-200',
      greetingText: isNight ? 'text-indigo-600' : 'text-orange-600',
      greetingMessage: isNight ? 'Late Night Cravings?' : 'Good Morning!',
      greetingIcon: isNight ? Moon : Sun,
      headerIcon: isNight ? "#1F2937" : "#5A189A", // Dark for both to ensure contrast on white
  };

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
        // Fallback to MOCK_PRODUCTS if DB is empty
        const fallback = MOCK_PRODUCTS.filter(p => {
            const matchesCategory = category === "All" || p.category === category;
            const matchesQuery = query.trim() === "" || p.name.toLowerCase().includes(query.toLowerCase());
            return matchesCategory && matchesQuery;
        });
        setProducts(fallback);
        setFilteredProducts(fallback);
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
      <SafeAreaView className={`flex-1 ${theme.bg}`}>
        <StatusBar barStyle={isNight ? "light-content" : "dark-content"} />

        {/* Header */}
        <View className={`px-4 py-3 flex-row items-center justify-between ${theme.bg}`}>
          <View>
            <View className="flex-row items-center mb-1">
                <View className={`px-2 py-0.5 rounded-md flex-row items-center border ${theme.greetingPill}`}>
                    <theme.greetingIcon size={10} color={isNight ? "#4F46E5" : "#EA580C"} />
                    <Text className={`font-black text-[10px] ml-1 uppercase tracking-wider ${theme.greetingText}`}>{theme.greetingMessage}</Text>
                </View>
            </View>
            <View className="flex-row items-center">
              <Text className={`${theme.textPrimary} font-black text-2xl tracking-tighter mr-2`}>JOINZO</Text>
              {isServicable && <CountdownTimer minutes={10} />}
            </View>
            <View className="flex-row items-center mt-2">
              <MapPin size={12} color={isServicable ? "#5A189A" : "#EF4444"} />
              <Text className={`${theme.textSecondary} text-xs ml-1 font-medium`}>
                {isServicable ? `From ${activeWarehouse?.name}` : 'Out of delivery zone'}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center space-x-3">
            <TouchableOpacity
              onPress={() => navigation.navigate('Discover')}
              className={`w-10 h-10 rounded-full items-center justify-center border ${isNight ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-brand-primary/10 border-brand-primary/20'}`}
            >
              <Compass size={20} color={isNight ? "#4F46E5" : "#5A189A"} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('NeighborhoodPulse')}
              className={`w-10 h-10 rounded-full items-center justify-center border ${isNight ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-brand-primary/10 border-brand-primary/20'}`}
            >
              <MessageSquare size={20} color={isNight ? "#4F46E5" : "#5A189A"} />
              <View className="absolute -top-1 -right-1 bg-green-500 rounded-full w-3 h-3 border-2 border-white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Profile')}
              className={`w-10 h-10 rounded-full items-center justify-center border ${theme.surface} ${theme.border}`}
            >
              <User size={20} color={theme.headerIcon} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Checkout')}
              className={`w-10 h-10 rounded-full items-center justify-center border ${theme.surface} ${theme.border}`}
            >
              <ShoppingCart size={20} color={theme.headerIcon} />
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
            <View className={`px-4 pb-3 shadow-sm z-10 ${theme.bg}`}>
              <View className={`flex-row items-center border rounded-2xl px-4 py-3 ${theme.surface} ${theme.border}`}>
                <Search size={20} color="#9CA3AF" />
                <TextInput
                  className={`flex-1 ml-3 font-medium ${theme.textPrimary}`}
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

              {/* CARBON SAVER TICKER */}
              <CarbonTicker />

              {/* FLASH MOB DISCOUNT */}
              <FlashMobDiscount />


              {/* Mystery Munchies Mock */}
              <TouchableOpacity 
                onPress={() => {
                  addToCart({ id: 888, name: "Mystic Munchies Bag", price: 99, qty: 1, type: "Solo" });
                  showNotification("Mystery Bag added! Open it after delivery 🎉", "success");
                }}
                className="mx-4 mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 p-5 rounded-3xl flex-row items-center justify-between shadow-lg shadow-brand-primary/40 -z-0"
                style={{ backgroundColor: '#2E1065' }} // Fallback if tailwind gradient acts up
              >
                <View className="flex-1 pr-4">
                  <View className="flex-row items-center mb-1">
                    <Sparkles size={16} color="#FBBF24" />
                    <Text className="text-yellow-400 font-black text-xs ml-2 uppercase tracking-widest">Surprise Inside</Text>
                  </View>
                  <Text className="text-white font-black text-2xl tracking-tighter mt-1">Mystery Bag</Text>
                  <Text className="text-white/80 font-bold text-xs mt-1 leading-4">Pay <Text className="text-green-400 font-black">₹99</Text> & perfectly usable overstock snacks worth <Text className="line-through">₹250+</Text>!</Text>
                </View>
                <View className="w-16 h-16 bg-white/10 rounded-2xl items-center justify-center border border-white/20 shadow-inner overflow-hidden">
                    <PackageOpen size={32} color="#FBBF24" />
                </View>
              </TouchableOpacity>

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

              {/* LIVE PRICE DROP ROULETTE */}
              <PriceDropRoulette />

              {/* RECIPE TO CART SECTION */}
              <RecipeSection />

              {/* 1-TAP ROUTINES BUILDER (Legacy) */}
              <RoutineSection />

              {/* AI PERSONALIZED ROUTINE BUILDER */}
              <AIRoutineBuilder />

              {/* ACTIVE LOOP ENGINE & HEATMAP LINK */}
              <View className="px-4">
                <TouchableOpacity 
                    onPress={() => navigation.navigate('Heatmap')}
                    className="bg-red-50 border border-red-100 p-4 rounded-3xl mb-4 flex-row items-center justify-between shadow-sm"
                >
                    <View className="flex-row items-center flex-1">
                        <View className="w-10 h-10 bg-red-500/20 rounded-full items-center justify-center border border-red-500/30 mr-3">
                            <Flame size={20} color="#EF4444" />
                        </View>
                        <View>
                            <Text className="text-red-600 font-black text-xs uppercase tracking-widest">Live Heatmap</Text>
                            <Text className="text-red-900 font-bold text-sm">See what your neighbors are ordering right now.</Text>
                        </View>
                    </View>
                </TouchableOpacity>

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
                        className={`mr-3 px-5 py-2.5 rounded-2xl border ${
                            isActive 
                                ? (isNight ? 'bg-indigo-600 border-indigo-600' : 'bg-brand-primary border-brand-primary')
                                : `${theme.surface} ${theme.border}`
                        }`}>
                        <Text className={`font-bold text-sm ${isActive ? 'text-white' : theme.textPrimary}`}>{cat}</Text>
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
                  filteredProducts.map((p: any) => {
                    const isExpiring = p.is_in_stock && p.id % 4 === 0; // Mock ~25% active items as expiring
                    return (
                      <ProductCard
                        key={p.id}
                        id={p.id}
                        name={p.name}
                        priceSolo={p.price_solo}
                        priceLoop={p.price_loop}
                        image={p.image_url}
                        weight={p.weight}
                        isInStock={p.is_in_stock}
                        isExpiringSoon={isExpiring}
                        discountedPrice={isExpiring ? Math.floor(p.price_solo * 0.4) : p.price_solo}
                      />
                    );
                  })
                ) : (
                  <Text className={`${theme.textPrimary} font-bold m-4 mx-auto mt-10 text-center`}>No products found in this category.</Text>
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

        {/* Floating Neighborhood Pulse Button */}
        <TouchableOpacity 
            onPress={() => navigation.navigate('NeighborhoodPulse')}
            className="absolute bottom-28 right-6 bg-brand-primary w-14 h-14 rounded-full items-center justify-center shadow-2xl shadow-brand-primary/60 border-2 border-white/20"
        >
            <MessageSquare size={24} color="#FFF" />
            <View className="absolute top-0 right-0 bg-green-500 w-4 h-4 rounded-full border-2 border-white items-center justify-center">
                <Text className="text-[8px] font-black text-white">42</Text>
            </View>
        </TouchableOpacity>

        {/* Global Social Ticker Overlay */}
        <SocialTicker />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
