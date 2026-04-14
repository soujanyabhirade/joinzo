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
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <Text>Diagnostic Mode</Text>
    </View>
  );
}
