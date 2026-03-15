import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../lib/supabase';

const MOCK_PRODUCTS = [
  { name: "Organic Whole Milk", price_solo: 90, price_loop: 70, image_url: "https://images.unsplash.com/photo-1550583724-125581fe2f8a?auto=format&fit=crop&q=80&w=800", category: "Dairy", weight: "1L" },
  { name: "Hass Avocado (2pcs)", price_solo: 299, price_loop: 249, image_url: "https://images.unsplash.com/photo-1601039676563-f193ff3fbbb2?auto=format&fit=crop&q=80&w=800", category: "Fresh", weight: "2 pcs" },
  { name: "Nitro Cold Brew", price_solo: 150, price_loop: 99, image_url: "https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&q=80&w=800", category: "Drinks", weight: "250ml" },
  { name: "Artisan Sourdough", price_solo: 145, price_loop: 120, image_url: "https://images.unsplash.com/photo-1585478259715-876a23d1ffbb?auto=format&fit=crop&q=80&w=800", category: "Groceries", weight: "400g" },
  { name: "Alphonso Mangoes (1kg)", price_solo: 499, price_loop: 399, image_url: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=800", category: "Fresh", weight: "1kg" },
  { name: "Greek Yogurt (500g)", price_solo: 120, price_loop: 85, image_url: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=800", category: "Dairy", weight: "500g" },
  { name: "Premium Oreo Cookies", price_solo: 150, price_loop: 110, image_url: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&q=80&w=800", category: "Snacks", weight: "150g" },
  { name: "Classic Coca-Cola (2L)", price_solo: 95, price_loop: 75, image_url: "https://images.unsplash.com/photo-1622483767028-3f66f34a1074?auto=format&fit=crop&q=80&w=800", category: "Drinks", weight: "2L" }
];

export const Seeder = () => {
    const [loading, setLoading] = useState(false);

    const handleSeed = async () => {
        setLoading(true);
        try {
            console.log("Starting NUCLEAR UI Seeder...");
            
            // 1. CLEAR ALL PRODUCTS (To remove old naming mismatches)
            console.log("Deleting old products...");
            const { error: delError } = await supabase.from('products').delete().neq('id', 0);
            if (delError) console.error("Note: Deletion failed (might be RLS):", delError.message);

            // 2. Fetch category map
            const categories = Array.from(new Set(MOCK_PRODUCTS.map(p => p.category)));
            for (const cat of categories) {
                await supabase.from('categories').upsert({ name: cat }, { onConflict: 'name' });
            }
            const { data: catData } = await supabase.from('categories').select('*');
            const catMap = (catData || []).reduce((acc, c) => ({ ...acc, [c.name]: c.id }), {});

            // 3. Insert fresh products
            console.log("Inserting fresh products...");
            for (const p of MOCK_PRODUCTS) {
                const { error: insError } = await supabase.from('products').insert({
                    name: p.name,
                    price_solo: p.price_solo,
                    price_loop: p.price_loop,
                    image_url: p.image_url,
                    category: p.category,
                    weight: p.weight,
                    is_in_stock: true
                });
                if (insError) console.error(`Error inserting ${p.name}:`, insError.message);
            }

            Alert.alert("NUCLEAR RESET COMPLETE", "OLD DATA WIPED. New high-quality images are now active! Please refresh twice.");
        } catch (error: any) {
            console.error("UI Seeding failed:", error.message);
            Alert.alert("Error", `Seeding failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="p-4 bg-brand-primary/10 border border-brand-primary/20 rounded-3xl m-4">
            <Text className="text-brand-primary font-black text-xs uppercase mb-2">Admin Tools</Text>
            <TouchableOpacity 
                onPress={handleSeed}
                disabled={loading}
                className="bg-brand-primary py-3 rounded-xl items-center"
            >
                {loading ? (
                    <ActivityIndicator color="#FFF" />
                ) : (
                    <Text className="text-white font-black">RESET DATABASE IMAGES</Text>
                )}
            </TouchableOpacity>
        </View>
    );
};
