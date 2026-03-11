import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Plus, Users, Zap } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

interface ProductCardProps {
    id: number;
    name: string;
    priceSolo: number;
    priceLoop: number;
    image: string;
    weight?: string;
    isInStock?: boolean;
    key?: React.Key;
}

export const ProductCard: React.FC<ProductCardProps> = ({ id, name, priceSolo, priceLoop, image, weight, isInStock = true }: ProductCardProps) => {
    const navigation = useNavigation<any>();
    const [isLoop, setIsLoop] = useState(true);

    const handleAction = () => {
        if (!isInStock) return;

        if (isLoop) {
            navigation.navigate("CreateTeam", { productId: id, productName: name, loopPrice: priceLoop });
        } else {
            // Simulated Add to Cart
            alert(`Added ${name} to cart for ₹${priceSolo}`);
        }
    };

    return (
        <View className="bg-soft-gray border border-gray-800 rounded-3xl p-4 w-[48%] mb-4 shadow-xl">
            {/* Product Image */}
            <View className="items-center justify-center h-32 mb-3 bg-deep-charcoal rounded-2xl">
                <Image
                    source={{ uri: image }}
                    className="w-full h-full rounded-2xl"
                    resizeMode="cover"
                />
                <View className="absolute top-2 left-2 bg-neon-green px-2 py-0.5 rounded-md flex-row items-center">
                    <Zap size={10} color="#121212" fill="#121212" />
                    <Text className="text-[10px] font-black text-deep-charcoal uppercase ml-1">Speed</Text>
                </View>
            </View>

            {/* Product Info */}
            <Text className="text-white font-bold text-sm h-10" numberOfLines={2}>{name}</Text>
            <Text className="text-gray-500 text-xs mt-1">{weight || "500g"}</Text>

            {/* Pricing Toggle */}
            <View className="flex-row items-center justify-between mt-4 bg-deep-charcoal p-1 rounded-xl border border-gray-800">
                <TouchableOpacity
                    onPress={() => setIsLoop(false)}
                    className={`flex-1 items-center py-1.5 rounded-lg ${!isLoop ? 'bg-soft-gray border border-gray-700' : ''}`}
                >
                    <Text className={`text-[10px] font-bold ${!isLoop ? 'text-white' : 'text-gray-500'}`}>SOLO</Text>
                    <Text className={`text-xs font-black ${!isLoop ? 'text-white' : 'text-gray-500'}`}>₹{priceSolo}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setIsLoop(true)}
                    className={`flex-1 items-center py-1.5 rounded-lg ${isLoop ? 'bg-neon-green border border-neon-green/30' : ''}`}
                >
                    <View className="flex-row items-center mb-0.5">
                        <Users size={8} color={isLoop ? "#121212" : "#6B7280"} />
                        <Text className={`text-[10px] font-bold ml-1 ${isLoop ? 'text-deep-charcoal' : 'text-gray-500'}`}>LOOP</Text>
                    </View>
                    <Text className={`text-xs font-black ${isLoop ? 'text-deep-charcoal' : 'text-neon-green'}`}>₹{priceLoop}</Text>
                </TouchableOpacity>
            </View>

            {/* Add Button */}
            {isInStock ? (
                <TouchableOpacity onPress={handleAction} className={`mt-3 border py-3 rounded-2xl flex-row items-center justify-center ${isLoop ? 'bg-neon-green/90 border-neon-green/50' : 'bg-neon-green/20 border-neon-green/50'}`}>
                    {isLoop ? <Users size={18} color="#121212" /> : <Plus size={18} color="#39FF14" />}
                    <Text className={`font-black ml-2 ${isLoop ? 'text-deep-charcoal' : 'text-neon-green'}`}>
                        {isLoop ? 'JOIN LOOP' : 'ADD SOLO'}
                    </Text>
                </TouchableOpacity>
            ) : (
                <View className="mt-3 bg-gray-800 border border-gray-700 py-3 rounded-2xl flex-row items-center justify-center">
                    <Text className="text-gray-500 font-bold ml-2">Stocking Now</Text>
                </View>
            )}
        </View>
    );
};
