import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Plus, Coffee, Moon, Sun, MonitorPlay, Zap } from 'lucide-react-native';
import { useCart } from '../lib/CartContext';
import { useNotification } from '../lib/NotificationContext';

const routines = [
    {
        id: 'r1',
        title: 'Sunday Recovery',
        icon: Coffee,
        price: 349,
        items: [
            { id: 901, name: "Electrolyte Drink", price: 80, qty: 1, type: "Solo", image: "https://images.unsplash.com/photo-1558252261-2b0e6e73c9f2?w=100&h=100&fit=crop" },
            { id: 902, name: "Pain Reliever", price: 40, qty: 1, type: "Solo", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&h=100&fit=crop" },
            { id: 903, name: "Gourmet Burger Kit", price: 229, qty: 1, type: "Solo", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&h=100&fit=crop" },
        ],
        gradient: 'from-orange-400 to-red-500'
    },
    {
        id: 'r2',
        title: 'Movie Night',
        icon: MonitorPlay,
        price: 299,
        items: [
            { id: 904, name: "Butter Popcorn", price: 99, qty: 1, type: "Solo", image: "https://images.unsplash.com/photo-1572097562444-1596e1cc3b5c?w=100&h=100&fit=crop" },
            { id: 905, name: "Cola 1L", price: 50, qty: 1, type: "Solo", image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=100&h=100&fit=crop" },
            { id: 906, name: "Chocolate Bites", price: 150, qty: 1, type: "Solo", image: "https://images.unsplash.com/photo-1548883354-94cb1408b340?w=100&h=100&fit=crop" },
        ],
        gradient: 'from-indigo-500 to-purple-600'
    },
    {
        id: 'r3',
        title: 'Midnight Cram',
        icon: Moon,
        price: 180,
        items: [
            { id: 907, name: "Energy Drink", price: 110, qty: 1, type: "Solo", image: "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=100&h=100&fit=crop" },
            { id: 908, name: "Instant Noodles", price: 70, qty: 1, type: "Solo", image: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=100&h=100&fit=crop" },
        ],
        gradient: 'from-blue-600 to-cyan-500'
    }
];

export const RoutineSection = () => {
    const { addToCart } = useCart();
    const { showNotification } = useNotification();

    const handleAddRoutine = (routine: typeof routines[0]) => {
        routine.items.forEach(item => {
            addToCart({ ...item, type: item.type as "Solo" | "Loop" });
        });
        showNotification(`${routine.title} bundle added to cart!`, "success");
    };

    return (
        <View className="mt-6 mb-2">
            <View className="px-4 flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                    <Zap size={20} color="#5A189A" fill="#5A189A" />
                    <Text className="text-text-primary font-black text-xl ml-2">1-Click Routines</Text>
                </View>
                <Text className="text-brand-primary font-bold text-xs uppercase tracking-widest">See All</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
                {routines.map((routine) => (
                    <TouchableOpacity
                        key={routine.id}
                        onPress={() => handleAddRoutine(routine)}
                        className={`mr-4 w-64 h-36 rounded-3xl overflow-hidden shadow-md`}
                    >
                        <View className={`absolute inset-0 bg-gradient-to-br ${routine.gradient} opacity-90`} />
                        <View className="p-4 flex-1 justify-between relative z-10">
                            <View className="flex-row justify-between items-start">
                                <View className="bg-white/20 p-2 rounded-xl backdrop-blur-sm border border-white/30">
                                    <routine.icon size={20} color="#FFF" />
                                </View>
                                <View className="bg-white px-3 py-1.5 rounded-full shadow-sm">
                                    <View className="flex-row items-center">
                                        <Plus size={12} color="#111827" />
                                        <Text className="text-gray-900 font-black text-xs ml-1">₹{routine.price}</Text>
                                    </View>
                                </View>
                            </View>

                            <View>
                                <Text className="text-white font-black text-lg tracking-tight shadow-sm">{routine.title}</Text>
                                <Text className="text-white/80 font-bold text-[10px] mt-0.5">
                                    {routine.items.length} Items Bundle
                                </Text>
                            </View>
                        </View>
                        
                        {/* Polaroid styled stacked items mock up */}
                        <View className="absolute -bottom-4 -right-4 flex-row" style={{ transform: [{ rotate: '-10deg' }] }}>
                            {routine.items.map((item, index) => (
                                <View 
                                    key={item.id} 
                                    className={`w-14 h-14 bg-white p-1 rounded-lg shadow-xl border border-gray-100 ${index > 0 ? '-ml-6' : ''}`}
                                    style={{ zIndex: routine.items.length - index, transform: [{ rotate: `${index * 8}deg` }] }}
                                >
                                    <Image source={{ uri: item.image }} className="flex-1 rounded border border-gray-200" />
                                </View>
                            ))}
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};
