import "../lib/nativewind";
import "../../global.css";
import React, { useState, useEffect } from 'react';
import { View, Text, StatusBar, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { MapPin, Zap, ShoppingCart, ArrowRight, User } from 'lucide-react-native';

// Components
import { FuzzySearch } from '../components/FuzzySearch';
import { LoopTicker } from '../components/LoopTicker';
import { ProductCard } from '../components/ProductCard';
import { AI_CartMergePopup } from '../components/AI_CartMergePopup';
import { FlashReplenish } from '../components/FlashReplenish';
import { LoopEngine } from '../components/LoopEngine';
import { CountdownTimer } from '../components/CountdownTimer';

// Hooks
import { useHapticArrival } from '../hooks/useHapticArrival';

// Supabase
import { supabase } from '../lib/supabase';

export default function HomeScreen({ navigation }: any) {
  const [showAI, setShowAI] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { startSimulation } = useHapticArrival();

  const categories = ["All", "Fresh", "Snacks", "Drinks", "Electronics", "Groceries", "Essentials"];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-deep-charcoal">
        <StatusBar barStyle="light-content" />

        {/* Header */}
        <View className="px-4 py-3 flex-row items-center justify-between">
          <View>
            <View className="flex-row items-center">
              <Text className="text-neon-green font-bold text-2xl tracking-tighter mr-2">JOINZO</Text>
              <CountdownTimer minutes={10} />
            </View>
            <View className="flex-row items-center mt-2">
              <MapPin size={12} color="#9CA3AF" />
              <Text className="text-gray-400 text-xs ml-1 font-medium">Delivering to Gate 2, Skyline Apts</Text>
            </View>
          </View>
          <View className="flex-row items-center space-x-3">
            <TouchableOpacity
              onPress={() => navigation.navigate('Profile')}
              className="w-10 h-10 rounded-full bg-soft-gray items-center justify-center border border-gray-800"
            >
              <User size={20} color="#9CA3AF" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Checkout')}
              className="w-10 h-10 rounded-full bg-soft-gray items-center justify-center border border-gray-800"
            >
              <ShoppingCart size={20} color="#39FF14" />
              <View className="absolute -top-1 -right-1 bg-neon-green rounded-full w-4 h-4 items-center justify-center">
                <Text className="text-[10px] font-black text-deep-charcoal">2</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <FuzzySearch />
          <LoopTicker />

          {/* SIMULATION CONTROLS (Demo Only) */}
          <View className="mx-4 mt-6 bg-neon-green/5 border border-neon-green/20 p-4 rounded-3xl">
            <Text className="text-neon-green text-[10px] font-black uppercase mb-3">2026 Tech Demo Controls</Text>
            <View className="flex-row justify-between">
              <TouchableOpacity onPress={() => setShowAI(true)} className="bg-neon-green/10 px-3 py-2 rounded-xl border border-neon-green/20">
                <Text className="text-neon-green text-[10px] font-bold">Trigger AI Popup</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={startSimulation} className="bg-neon-green/10 px-3 py-2 rounded-xl border border-neon-green/20">
                <Text className="text-neon-green text-[10px] font-bold">Simulate Haptic</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Alert.alert("Joinzo", "Subscribed to restock alerts!")} className="bg-neon-green/10 px-3 py-2 rounded-xl border border-neon-green/20">
                <Text className="text-neon-green text-[10px] font-bold">Sub Restock</Text>
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
              {categories.map((cat, idx) => (
                <TouchableOpacity key={cat} className={`mr-3 px-5 py-2.5 rounded-2xl border ${idx === 1 ? 'bg-neon-green border-neon-green' : 'bg-soft-gray border-gray-800'}`}>
                  <Text className={`font-bold text-sm ${idx === 1 ? 'text-deep-charcoal' : 'text-gray-400'}`}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Product Grid */}
          <View className="px-4 mt-6 flex-row flex-wrap justify-between">
            {loading ? (
              <Text className="text-gray-400 font-bold m-4 mx-auto">Loading fresh stock...</Text>
            ) : products.length > 0 ? (
              products.map((p) => (
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
              <Text className="text-gray-400 font-bold m-4 mx-auto">No products found. Please run the Supabase phase 2 SQL query.</Text>
            )}
            <FlashReplenish itemName="Nitro Cold Brew (V4)" onNotify={() => Alert.alert("Joinzo", "Notification set!")} />
          </View>

          <View className="h-32" />
        </ScrollView>

        {showAI && (
          <AI_CartMergePopup
            onAdd={() => { setShowAI(false); Alert.alert("Joinzo", "Marie Biscuits added with 5% discount!"); }}
            onDismiss={() => setShowAI(false)}
          />
        )}

      </SafeAreaView>
    </SafeAreaProvider>
  );
}
