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
import AsyncStorage from '@react-native-async-storage/async-storage';

const MOCK_PRODUCTS = [
    // Fresh
    { id: 1,  name: "Alphonso Mangoes (1kg)", price_solo: 499, price_loop: 399, image_url: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&fit=crop&q=80", category: "Fresh", weight: "1kg", is_in_stock: true },
    { id: 5,  name: "Organic Spinach", price_solo: 60, price_loop: 45, image_url: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&fit=crop&q=80", category: "Fresh", weight: "250g", is_in_stock: true },
    { id: 7,  name: "Hass Avocados (Pack of 2)", price_solo: 299, price_loop: 249, image_url: "https://images.unsplash.com/photo-1601039676563-f193ff3fbbb2?w=400&fit=crop&q=80", category: "Fresh", weight: "2 units", is_in_stock: true },
    { id: 9,  name: "Red Onions (1kg)", price_solo: 55, price_loop: 40, image_url: "https://images.unsplash.com/photo-1618512496248-a07fe83e4c44?w=400&fit=crop&q=80", category: "Fresh", weight: "1kg", is_in_stock: true },
    { id: 10, name: "Tomatoes (500g)", price_solo: 45, price_loop: 32, image_url: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&fit=crop&q=80", category: "Fresh", weight: "500g", is_in_stock: true },
    { id: 11, name: "Bananas (Dozen)", price_solo: 60, price_loop: 45, image_url: "https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=400&fit=crop&q=80", category: "Fresh", weight: "12 pcs", is_in_stock: true },
    { id: 12, name: "Watermelon (1 pc)", price_solo: 120, price_loop: 90, image_url: "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=400&fit=crop&q=80", category: "Fresh", weight: "2-3kg", is_in_stock: true },

    // Dairy
    { id: 2,  name: "Greek Yogurt (500g)", price_solo: 120, price_loop: 85, image_url: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&fit=crop&q=80", category: "Dairy", weight: "500g", is_in_stock: true },
    { id: 13, name: "Full Cream Milk (1L)", price_solo: 68, price_loop: 55, image_url: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&fit=crop&q=80", category: "Dairy", weight: "1L", is_in_stock: true },
    { id: 14, name: "Amul Butter (500g)", price_solo: 240, price_loop: 210, image_url: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&fit=crop&q=80", category: "Dairy", weight: "500g", is_in_stock: true },
    { id: 15, name: "Farm Fresh Eggs (12 pcs)", price_solo: 120, price_loop: 95, image_url: "https://images.unsplash.com/photo-1582797493098-23d8d0cc6769?w=400&fit=crop&q=80", category: "Dairy", weight: "12 pcs", is_in_stock: true },
    { id: 16, name: "Cheddar Cheese (200g)", price_solo: 280, price_loop: 230, image_url: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&fit=crop&q=80", category: "Dairy", weight: "200g", is_in_stock: true },

    // Snacks
    { id: 3,  name: "Premium Oreo Cookies", price_solo: 150, price_loop: 110, image_url: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&fit=crop&q=80", category: "Snacks", weight: "150g", is_in_stock: true },
    { id: 6,  name: "Digestive Biscuits", price_solo: 40, price_loop: 32, image_url: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&fit=crop&q=80", category: "Snacks", weight: "200g", is_in_stock: true },
    { id: 17, name: "Lay's Classic Salted", price_solo: 30, price_loop: 22, image_url: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&fit=crop&q=80", category: "Snacks", weight: "90g", is_in_stock: true },
    { id: 18, name: "Sea Salt Dark Chocolate", price_solo: 299, price_loop: 240, image_url: "https://images.unsplash.com/photo-1511381939415-e44aa117067b?w=400&fit=crop&q=80", category: "Snacks", weight: "100g", is_in_stock: true },
    { id: 19, name: "Mixed Nuts & Raisins", price_solo: 340, price_loop: 280, image_url: "https://images.unsplash.com/photo-1567586879816-39a8c4cd1f01?w=400&fit=crop&q=80", category: "Snacks", weight: "250g", is_in_stock: true },
    { id: 20, name: "Popcorn Party Pack", price_solo: 120, price_loop: 90, image_url: "https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=400&fit=crop&q=80", category: "Snacks", weight: "200g", is_in_stock: true },

    // Drinks
    { id: 4,  name: "Classic Coca-Cola (2L)", price_solo: 95, price_loop: 75, image_url: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&fit=crop&q=80", category: "Drinks", weight: "2L", is_in_stock: true },
    { id: 21, name: "Sparkling Water (6-pack)", price_solo: 180, price_loop: 140, image_url: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&fit=crop&q=80", category: "Drinks", weight: "6 x 500ml", is_in_stock: true },
    { id: 22, name: "Fresh Orange Juice (1L)", price_solo: 150, price_loop: 115, image_url: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&fit=crop&q=80", category: "Drinks", weight: "1L", is_in_stock: true },
    { id: 23, name: "Green Tea (25 bags)", price_solo: 180, price_loop: 140, image_url: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&fit=crop&q=80", category: "Drinks", weight: "25 bags", is_in_stock: true },

    // Groceries
    { id: 8,  name: "Artisan Sourdough Bread", price_solo: 145, price_loop: 120, image_url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&fit=crop&q=80", category: "Groceries", weight: "400g", is_in_stock: true },
    { id: 24, name: "Basmati Rice (5kg)", price_solo: 450, price_loop: 380, image_url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&fit=crop&q=80", category: "Groceries", weight: "5kg", is_in_stock: true },
    { id: 25, name: "Toor Dal (1kg)", price_solo: 160, price_loop: 130, image_url: "https://images.unsplash.com/photo-1602340875671-2b32d7fbdb63?w=400&fit=crop&q=80", category: "Groceries", weight: "1kg", is_in_stock: true },
    { id: 26, name: "Extra Virgin Olive Oil (500ml)", price_solo: 550, price_loop: 450, image_url: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&fit=crop&q=80", category: "Groceries", weight: "500ml", is_in_stock: true },

    // Essentials
    { id: 27, name: "Sanitizer Spray (300ml)", price_solo: 99, price_loop: 75, image_url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&fit=crop&q=80", category: "Essentials", weight: "300ml", is_in_stock: true },
    { id: 28, name: "Dish Wash Liquid (750ml)", price_solo: 120, price_loop: 90, image_url: "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=400&fit=crop&q=80", category: "Essentials", weight: "750ml", is_in_stock: true },
    { id: 29, name: "Tissues (6-pack)", price_solo: 180, price_loop: 140, image_url: "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400&fit=crop&q=80", category: "Essentials", weight: "6 x 100 sheets", is_in_stock: true },
    { id: 30, name: "Shampoo (200ml)", price_solo: 220, price_loop: 175, image_url: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=400&fit=crop&q=80", category: "Essentials", weight: "200ml", is_in_stock: true },
];

export default function HomeScreen({ navigation }: any) {
  const [showAI, setShowAI] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showSeeder, setShowSeeder] = useState(false);
  const [userBuilding, setUserBuilding] = useState<any>(null);
  const [isServicable, setIsServicable] = useState(true);
  const [nearbyWarehouse, setNearbyWarehouse] = useState<string | null>(null);

  const checkServiceability = async (lat: number, lng: number) => {
      // Mock geofencing check against warehouse schema
      // In production, this would be a Supabase RPC call using PostGIS
      const isNear = true; // Simulating successful check
      setIsServicable(isNear);
      setNearbyWarehouse('wh_indiranagar_01');
  };
  const [sortMode, setSortMode] = useState<'default' | 'low' | 'high' | 'popular'>('default');
  const isProduction = false; // Toggle this to true before App Store submission
  const { startSimulation } = useHapticArrival();
  const { cartItems, addToCart } = useCart();
  const { isServicable: isServicableFromContext, activeWarehouse, setUserLocation, userLocation } = useLocation(); // Renamed to avoid conflict
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

  const CATEGORY_EMOJIS: Record<string, string> = { All: 'ðŸ ', Fresh: 'ðŸ¥¬', Snacks: 'ðŸ¿', Drinks: 'ðŸ¥¤', Electronics: 'ðŸ“±', Groceries: 'ðŸ›’', Essentials: 'ðŸ§´', Dairy: 'ðŸ¥›' };
  const categories = useMemo(() => ["All", "Fresh", "Snacks", "Drinks", "Dairy", "Groceries", "Essentials"], []);

  const fetchProducts = useCallback(async (category = activeCategory, query = searchQuery) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('products').select('*');

      if (error && error.code !== 'PGRST116') throw error;

      let allProducts = (data && data.length > 0) ? data : MOCK_PRODUCTS;

      let filtered = allProducts;
      if (category !== "All") {
        filtered = filtered.filter((p: any) => p.category === category);
      }
      if (query.trim() !== "") {
        const q = query.toLowerCase();
        filtered = filtered.filter((p: any) => p.name.toLowerCase().includes(q));
      }

      setProducts(allProducts);
      setFilteredProducts(filtered);
    } catch (err: any) {
      console.error("Error fetching products:", err);
      showNotification("Failed to load products.", "error");
    } finally {
      setLoading(false);
    }
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    fetchProducts();

    // Subscribe to real-time inventory updates
    const subscription = supabase
      .channel('public:products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          setProducts(curr => curr.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p));
          setFilteredProducts(curr => curr.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p));
        } else if (payload.eventType === 'INSERT') {
          setProducts(curr => [payload.new, ...curr]);
          setFilteredProducts(curr => [payload.new, ...curr]);
        } else if (payload.eventType === 'DELETE') {
          setProducts(curr => curr.filter(p => p.id !== payload.old.id));
          setFilteredProducts(curr => curr.filter(p => p.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [fetchProducts]);

  // Debounce search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(activeCategory, searchQuery);
    }, 500);

    const loadBuildingAndCheckServiceability = async () => {
        try {
            const storedBuilding = await AsyncStorage.getItem('@joinzo_user_building');
            if (storedBuilding) {
                setUserBuilding(JSON.parse(storedBuilding));
            }
            if (userLocation) { // Using userLocation from useLocation hook
                checkServiceability(userLocation.lat, userLocation.lng);
            }
        } catch (err) {
            console.error("Error loading building or checking serviceability:", err);
        }
    };
    loadBuildingAndCheckServiceability();

    return () => clearTimeout(timer);
  }, [searchQuery, activeCategory, userLocation]); // Added userLocation to dependencies

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
              {isServicableFromContext && <CountdownTimer minutes={10} />}
            </View>
            <View className="flex-row items-center mt-2">
              <MapPin size={12} color={isServicableFromContext ? "#5A189A" : "#EF4444"} />
              <Text className={`${theme.textSecondary} text-xs ml-1 font-black uppercase tracking-tighter`}>
                {userBuilding ? userBuilding.name : (isServicableFromContext ? activeWarehouse?.name : 'Out of delivery zone')}
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

        {isServicableFromContext ? (
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
                  showNotification("Mystery Bag added! Open it after delivery ðŸŽ‰", "success");
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
                  <Text className="text-white/80 font-bold text-xs mt-1 leading-4">Pay <Text className="text-green-400 font-black">â‚¹99</Text> & perfectly usable overstock snacks worth <Text className="line-through">â‚¹250+</Text>!</Text>
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
                  <Text className="text-white/80 font-bold text-xs mt-1">On your first 3 orders above â‚¹199.</Text>
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
                        <Text className="text-brand-primary font-black text-xs">â‚¹{p.price_solo}</Text>
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

              {/* NEIGHBORS ORDERING NOW (Building Leaderboard Lite) */}
              <View className="mt-8 px-4">
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center">
                    <Text className={`${theme.textPrimary} font-black text-lg tracking-tighter`}>Neighbors Ordering Now</Text>
                    <View className="ml-2 bg-green-500 w-2 h-2 rounded-full animate-pulse" />
                  </View>
                </View>
                <View className={`${theme.surface} border ${theme.border} p-5 rounded-[32px] shadow-sm`}>
                    <View className="flex-row items-center mb-6">
                        <MapPin size={18} color="#5A189A" />
                        <View className="ml-3 flex-1">
                            <Text className="text-brand-primary font-black text-[10px] uppercase tracking-widest">
                                {isServicable ? 'âš¡ Serving Your Community' : 'ðŸš« Outside Delivery Zone'}
                            </Text>
                            <Text style={{ color: theme.textPrimary }} className="font-black text-lg tracking-tighter" numberOfLines={1}>
                                {userBuilding?.name || 'Loading location...'}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => navigation.navigate('BuildingSelection')} className="bg-brand-primary/10 px-4 py-2 rounded-full">
                            <Text className="text-brand-primary font-black text-[10px] uppercase">Change</Text>
                        </TouchableOpacity>
                    </View>

                    {!isServicable && (
                        <View className="bg-red-500/10 p-4 rounded-3xl mb-6 border border-red-500/20">
                            <Text className="text-red-600 font-bold text-xs text-center">Currently, we aren't delivering to this area. Stay tuned!</Text>
                        </View>
                    )}
                    {[
                        { name: "Rahul S.", items: "Milk, Bread", time: "2m ago", savings: "â‚¹45" },
                        { name: "Priya M.", items: "Mangoes, Curd", time: "5m ago", savings: "â‚¹120" },
                        { name: "Suresh K.", items: "Coke, Chips", time: "8m ago", savings: "â‚¹30" }
                    ].map((n, i) => (
                        <View key={i} className={`flex-row items-center justify-between ${i !== 2 ? 'mb-4 pb-4 border-b border-brand-primary/5' : ''}`}>
                            <View className="flex-row items-center">
                                <View className="w-8 h-8 rounded-full bg-brand-primary/10 items-center justify-center mr-3">
                                    <User size={14} color="#5A189A" />
                                </View>
                                <View>
                                    <Text className={`${theme.textPrimary} font-bold text-xs`}>{n.name}</Text>
                                    <Text className="text-gray-400 text-[10px] uppercase font-black">{n.items}</Text>
                                </View>
                            </View>
                            <View className="items-end">
                                <Text className="text-brand-primary font-black text-[10px]">{n.savings} Saved</Text>
                                <Text className="text-gray-400 text-[8px] uppercase font-black">{n.time}</Text>
                            </View>
                        </View>
                    ))}
                    <TouchableOpacity className="mt-4 bg-brand-primary/5 py-3 rounded-2xl items-center">
                        <Text className="text-brand-primary font-black text-[10px] uppercase tracking-widest">Join Building Leaderboard</Text>
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

                <TouchableOpacity onPress={() => navigation.navigate('MyLoops')}>
                  <LoopEngine
                    itemName="Organic Whole Milk"
                    currentMembers={3}
                    neededMembers={5}
                    discount="30%"
                    teamId="organic-milk-402"
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
                        <Text className={`font-bold text-sm ${isActive ? 'text-white' : theme.textPrimary}`}>{CATEGORY_EMOJIS[cat] || 'ðŸ“¦'} {cat}</Text>
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
                    <Text className={`text-xs font-bold ${sortMode === 'low' ? 'text-white' : theme.textPrimary}`}>â‚¹ Low</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => {
                      setSortMode('high');
                      setFilteredProducts(prev => [...prev].sort((a, b) => (b.price_solo || b.price || 0) - (a.price_solo || a.price || 0)));
                    }}
                    className={`px-3 py-1.5 rounded-full mr-2 ${sortMode === 'high' ? 'bg-brand-primary' : `${theme.surface} border ${theme.border}`}`}
                  >
                    <Text className={`text-xs font-bold ${sortMode === 'high' ? 'text-white' : theme.textPrimary}`}>â‚¹ High</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => setSortMode('popular')}
                    className={`px-3 py-1.5 rounded-full ${sortMode === 'popular' ? 'bg-brand-primary' : `${theme.surface} border ${theme.border}`}`}
                  >
                    <Text className={`text-xs font-bold ${sortMode === 'popular' ? 'text-white' : theme.textPrimary}`}>ðŸ”¥</Text>
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
