import "../lib/nativewind";
import "../../global.css";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StatusBar, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { MapPin, Zap, ShoppingCart, User, Search, Gift, PackageOpen, Sparkles, Compass, Flame, Sun, Moon, MessageSquare, RotateCw, ArrowDownUp } from 'lucide-react-native';
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
import { Seeder } from '../components/Seeder';
import { ProductSkeleton } from '../components/Skeleton';
import { FloatingCartBar } from '../components/FloatingCartBar';


// Hooks
import { useHapticArrival } from '../hooks/useHapticArrival';

// Supabase
import { supabase } from '../lib/supabase';
import { useCart } from '../lib/CartContext';
import { useLocation } from '../lib/LocationContext';
import { useNotification } from '../lib/NotificationContext';
import { useTheme } from '../lib/ThemeContext';

const MOCK_PRODUCTS = [
    { id: 1, name: "Alphonso Mangoes (1kg)", price_solo: 499, price_loop: 399, image_url: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=800", category: "Fresh", weight: "1kg", is_in_stock: true },
    { id: 2, name: "Greek Yogurt (500g)", price_solo: 120, price_loop: 85, image_url: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=800", category: "Dairy", weight: "500g", is_in_stock: true },
    { id: 3, name: "Premium Oreo Cookies", price_solo: 150, price_loop: 110, image_url: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&q=80&w=800", category: "Snacks", weight: "150g", is_in_stock: true },
    { id: 4, name: "Classic Coca-Cola (2L)", price_solo: 95, price_loop: 75, image_url: "https://images.unsplash.com/photo-1622483767028-3f66f34a1074?auto=format&fit=crop&q=80&w=800", category: "Drinks", weight: "2L", is_in_stock: true },
    { id: 5, name: "Organic Spinach", price_solo: 60, price_loop: 45, image_url: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80&w=800", category: "Fresh", weight: "250g", is_in_stock: true },
    { id: 6, name: "Digestive Biscuits", price_solo: 40, price_loop: 32, image_url: "https://images.unsplash.com/photo-1590080874088-eec64895b423?auto=format&fit=crop&q=80&w=800", category: "Snacks", weight: "200g", is_in_stock: true },
    { id: 7, name: "Hass Avocados (Pack of 2)", price_solo: 299, price_loop: 249, image_url: "https://images.unsplash.com/photo-1601039676563-f193ff3fbbb2?auto=format&fit=crop&q=80&w=800", category: "Fresh", weight: "2 units", is_in_stock: true },
    { id: 8, name: "Artisan Sourdough", price_solo: 145, price_loop: 120, image_url: "https://images.unsplash.com/photo-1585478259715-876a23d1ffbb?auto=format&fit=crop&q=80&w=800", category: "Groceries", weight: "400g", is_in_stock: true }
];

export default function HomeScreen({ navigation }: any) {
  const [showAI, setShowAI] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showSeeder, setShowSeeder] = useState(false);
  const [sortMode, setSortMode] = useState<'default' | 'low' | 'high' | 'popular'>('default');
  const isProduction = false; // Toggle this to true before App Store submission
  const { startSimulation } = useHapticArrival();
  const { cartItems, addToCart } = useCart();
  const { isServicable, activeWarehouse, setUserLocation } = useLocation();
  const { showNotification } = useNotification();
  const { isDarkMode } = useTheme();
  
  const isNight = isDarkMode;
  
  // Dynamic themes based on time
  const theme = {
      bg: isNight ? 'bg-[#0A0A0A]' : 'bg-white', 
      surface: isNight ? 'bg-[#121212]' : 'bg-white', 
      textPrimary: isNight ? 'text-white' : 'text-text-primary',
      textSecondary: isNight ? 'text-gray-400' : 'text-text-secondary',
      border: isNight ? 'border-white/10' : 'border-gray-200',
      greetingPill: isNight ? 'bg-indigo-900/30 border-indigo-500/30' : 'bg-orange-100 border-orange-200',
      greetingText: isNight ? 'text-indigo-400' : 'text-orange-600',
      greetingMessage: isNight ? 'Late Night Cravings?' : 'Good Morning!',
      greetingIcon: isNight ? Moon : Sun,
      headerIcon: isNight ? "#FFFFFF" : "#5A189A",
  };

  const CATEGORY_EMOJIS: Record<string, string> = { All: '🏠', Fresh: '🥬', Snacks: '🍿', Drinks: '🥤', Electronics: '📱', Groceries: '🛒', Essentials: '🧴', Dairy: '🥛' };
  const categories = useMemo(() => ["All", "Fresh", "Snacks", "Drinks", "Dairy", "Groceries", "Essentials"], []);

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
        console.log("Supabase Products Fetched:", data.map(p => ({ name: p.name, img: p.image_url })));
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

            {/* DB IMAGERY RESET TOOL */}
            {showSeeder && <Seeder />}

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

              {/* "FOR YOU" (Buy it Again) SECTION */}
              <View className="mt-8 px-4">
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center">
                    <Text className={`${theme.textPrimary} font-black text-lg tracking-tighter`}>For You</Text>
                    <View className="ml-2 bg-brand-primary/10 px-2 py-0.5 rounded-md">
                      <Text className="text-brand-primary text-[8px] font-black uppercase">Buy it again</Text>
                    </View>
                  </View>
                  <TouchableOpacity>
                    <Text className="text-brand-primary font-bold text-xs">View History</Text>
                  </TouchableOpacity>
                </View>
                
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4 px-4">
                  {MOCK_PRODUCTS.slice(0, 4).map((p) => (
                    <TouchableOpacity 
                      key={`foryou-${p.id}`}
                      onPress={() => addToCart({ ...p, price: p.price_solo, qty: 1, type: "Solo" })}
                      activeOpacity={0.8}
                      className={`${theme.surface} border ${theme.border} p-3 rounded-3xl mr-3 w-32 shadow-sm`}
                    >
                      <View className="w-10 h-10 bg-brand-primary/10 rounded-xl items-center justify-center mb-3">
                         <RotateCw size={18} color="#5A189A" />
                      </View>
                      <Text className={`${theme.textPrimary} font-black text-xs leading-4 h-8`} numberOfLines={2}>{p.name}</Text>
                      <View className="flex-row items-center justify-between mt-2">
                        <Text className="text-brand-primary font-black text-xs">₹{p.price_solo}</Text>
                        <View className="bg-brand-primary w-6 h-6 rounded-full items-center justify-center">
                          <Text className="text-white font-black">+</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* SIMULATION CONTROLS (Demo Only) */}
              {!isProduction && (
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
                    <TouchableOpacity onPress={() => setShowSeeder(!showSeeder)} className="bg-purple-500/10 px-3 py-2 rounded-xl border border-purple-500/20">
                      <Text className="text-purple-500 text-[10px] font-bold">{showSeeder ? 'Hide Seeder' : 'Show Seeder'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

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

                <TouchableOpacity onPress={() => navigation.navigate('MyLoops')}>
                  <LoopEngine
                    itemName="Organic Whole Milk"
                    currentMembers={3}
                    neededMembers={5}
                    discount="30%"
                  />
                </TouchableOpacity>
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
                        <Text className={`font-bold text-sm ${isActive ? 'text-white' : theme.textPrimary}`}>{CATEGORY_EMOJIS[cat] || '📦'} {cat}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Sort Toggle Bar */}
              <View className="px-4 mt-4 flex-row items-center justify-between">
                <Text className={`${theme.textSecondary} font-bold text-xs`}>
                  {filteredProducts.length} products{searchQuery ? ` for "${searchQuery}"` : ''}
                </Text>
                <View className="flex-row items-center">
                  <TouchableOpacity 
                    onPress={() => setSortMode('default')}
                    className={`px-3 py-1.5 rounded-full mr-2 ${sortMode === 'default' ? 'bg-brand-primary' : `${theme.surface} border ${theme.border}`}`}
                  >
                    <Text className={`text-xs font-bold ${sortMode === 'default' ? 'text-white' : theme.textPrimary}`}>Relevant</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => {
                      setSortMode('low');
                      setFilteredProducts(prev => [...prev].sort((a, b) => (a.price_solo || a.price || 0) - (b.price_solo || b.price || 0)));
                    }}
                    className={`px-3 py-1.5 rounded-full mr-2 ${sortMode === 'low' ? 'bg-brand-primary' : `${theme.surface} border ${theme.border}`}`}
                  >
                    <Text className={`text-xs font-bold ${sortMode === 'low' ? 'text-white' : theme.textPrimary}`}>₹ Low</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => {
                      setSortMode('high');
                      setFilteredProducts(prev => [...prev].sort((a, b) => (b.price_solo || b.price || 0) - (a.price_solo || a.price || 0)));
                    }}
                    className={`px-3 py-1.5 rounded-full mr-2 ${sortMode === 'high' ? 'bg-brand-primary' : `${theme.surface} border ${theme.border}`}`}
                  >
                    <Text className={`text-xs font-bold ${sortMode === 'high' ? 'text-white' : theme.textPrimary}`}>₹ High</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => setSortMode('popular')}
                    className={`px-3 py-1.5 rounded-full ${sortMode === 'popular' ? 'bg-brand-primary' : `${theme.surface} border ${theme.border}`}`}
                  >
                    <Text className={`text-xs font-bold ${sortMode === 'popular' ? 'text-white' : theme.textPrimary}`}>🔥</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Product Grid */}
              <View className="px-4 mt-6 flex-row flex-wrap justify-between">
                {loading ? (
                  <>
                    {[1, 2, 3, 4, 5, 6].map(i => <ProductSkeleton key={i} />)}
                  </>
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((p: any) => {
                    const isExpiring = p.is_in_stock && p.id % 4 === 0; // Mock ~25% active items as expiring
                    return (
                      <ProductCard
                        key={p.id}
                        id={p.id}
                        name={p.name}
                        priceSolo={p.price_solo || p.price || 0}
                        priceLoop={p.price_loop || p.priceLoop || 0}
                        image={p.image_url || p.image || ""}
                        weight={p.weight || "Unit"}
                        isInStock={p.is_in_stock}
                        isExpiringSoon={isExpiring}
                        discountedPrice={isExpiring ? Math.floor((p.price_solo || p.price || 0) * 0.4) : (p.price_solo || p.price || 0)}
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

        {/* Floating Cart Bar (Sticky) */}
        <FloatingCartBar />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
