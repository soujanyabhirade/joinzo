import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Alert, Platform, Linking } from 'react-native';
import { Plus, Users, Zap, Share2, Heart } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../lib/CartContext';
import { useNotification } from '../lib/NotificationContext';

interface ProductCardProps {
    id: number;
    name: string;
    priceSolo: number;
    priceLoop: number;
    image: string;
    weight?: string;
    isInStock?: boolean;
    isExpiringSoon?: boolean;
    discountedPrice?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ id, name, priceSolo, priceLoop, image, weight, isInStock = true, isExpiringSoon = false, discountedPrice }: ProductCardProps) => {
    const navigation = useNavigation<any>();
    const [isLoop, setIsLoop] = useState(true);
    const [hasVoted, setHasVoted] = useState(false);
    const [votes, setVotes] = useState(42 + (id % 10)); // Mock varied initial votes
    const { addToCart, favorites, toggleFavorite } = useCart();
    const { showNotification } = useNotification();
    const isFavorited = favorites.includes(id);

    // Mock progress calculation based on Product ID to keep it deterministic
    const requiredMembers = 5;
    const currentMembers = (id % 4) + 1; // 1 to 4 members
    const progressPercent = (currentMembers / requiredMembers) * 100;
    const membersNeeded = requiredMembers - currentMembers;

    const handleAction = () => {
        if (!isInStock) return;

        if (isLoop) {
            navigation.navigate("CreateTeam", { productId: id, productName: name, loopPrice: priceLoop });
        } else {
            const finalPrice = isExpiringSoon && discountedPrice ? discountedPrice : priceSolo;
            addToCart({ id, name, price: finalPrice, qty: 1, type: "Solo" });
            showNotification(`Added ${name} for ₹${finalPrice}`, "success");
        }
    };

    const handleShare = () => {
        const message = `Hey! Let's team up to buy ${name} at a loop discount on Joinzo for just ₹${priceLoop}!`;
        if (Platform.OS === 'web') {
            window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
        } else {
            Linking.openURL(`whatsapp://send?text=${encodeURIComponent(message)}`).catch(() => {
                Alert.alert("WhatsApp Not Found", "Please install WhatsApp to share.");
            });
        }
    };

    return (
        <View style={{ backdropFilter: 'blur(16px)' } as any} className={`bg-white/80 border ${isInStock ? 'border-white/60' : 'border-white/20'} rounded-3xl p-4 w-[48%] mb-4 shadow-xl shadow-brand-primary/10 transition-transform duration-300 hover:-translate-y-1 z-10 overflow-visible`}>
            {/* 3D Glass Highlight */}
            <View className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-t-3xl pointer-events-none" />
            
            {/* Product Image */}
            <View className={`items-center justify-center h-32 mb-3 bg-ui-background/50 rounded-2xl overflow-hidden border border-white/50 shadow-inner ${!isInStock ? 'opacity-40' : ''}`}>
                {isExpiringSoon && (
                    <View className="absolute top-0 left-0 right-0 bg-red-500 py-1 items-center justify-center z-10 w-full">
                        <Text className="text-white text-[9px] font-black uppercase tracking-widest">🚨 SECONDS RACK - {Math.floor((id % 50) + 10)}M LEFT</Text>
                    </View>
                )}
                <Image
                    source={{ uri: image }}
                    className="w-full h-full"
                    resizeMode="cover"
                />
                <View className="absolute top-2 left-2 bg-brand-primary px-2 py-0.5 rounded-md flex-row items-center">
                    <Zap size={10} color="#FFFFFF" fill="#FFFFFF" />
                    <Text className="text-[10px] font-black text-white uppercase ml-1">Speed</Text>
                </View>
                <TouchableOpacity onPress={handleShare} className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full shadow-sm">
                    <Share2 size={14} color="#5A189A" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => toggleFavorite(id)} className="absolute top-10 right-2 bg-white/80 p-1.5 rounded-full shadow-sm">
                    <Heart size={14} color={isFavorited ? "#EF4444" : "#9CA3AF"} fill={isFavorited ? "#EF4444" : "transparent"} />
                </TouchableOpacity>
            </View>

            {/* Product Info */}
            <Text className="text-text-primary font-bold text-sm h-10" numberOfLines={2}>{name}</Text>
            <Text className="text-text-secondary text-xs mt-1">{weight || "500g"}</Text>

            {/* Loop Progress Bar */}
            {isLoop && isInStock && (
                <View className="mt-3">
                    <View className="flex-row justify-between items-center mb-1">
                        <Text className="text-text-secondary text-[10px] font-bold"><Text className="text-brand-primary font-black">{currentMembers}</Text> Joined</Text>
                        <Text className="text-brand-primary text-[10px] font-black">{membersNeeded} More Needed</Text>
                    </View>
                    <View className="h-1.5 w-full bg-brand-primary/10 rounded-full overflow-hidden">
                        <View className="h-full bg-brand-primary rounded-full" style={{ width: `${progressPercent}%` }} />
                    </View>
                </View>
            )}

            {/* Pricing Toggle */}
            <View className="flex-row items-center justify-between mt-4 bg-ui-background/40 p-1 rounded-xl border border-white/60 shadow-inner">
                <TouchableOpacity
                    onPress={() => setIsLoop(false)}
                    className={`flex-1 items-center py-1.5 rounded-lg ${!isLoop ? 'bg-ui-surface border border-gray-300' : ''}`}
                >
                    <Text className={`text-[10px] font-bold ${!isLoop ? 'text-text-primary' : 'text-gray-400'}`}>SOLO</Text>
                    {isExpiringSoon && discountedPrice ? (
                        <View className="items-center flex-row">
                            <Text className="text-[10px] text-text-secondary line-through mr-1">₹{priceSolo}</Text>
                            <Text className={`text-xs font-black text-red-500 animate-pulse`}>₹{discountedPrice}</Text>
                        </View>
                    ) : (
                        <Text className={`text-xs font-black ${!isLoop ? 'text-text-primary' : 'text-gray-400'}`}>₹{priceSolo}</Text>
                    )}
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setIsLoop(true)}
                    className={`flex-1 items-center py-1.5 rounded-lg ${isLoop ? 'bg-brand-primary border border-brand-primary/50' : ''}`}
                >
                    <View className="flex-row items-center mb-0.5">
                        <Users size={8} color={isLoop ? "#FFFFFF" : "#9CA3AF"} />
                        <Text className={`text-[10px] font-bold ml-1 ${isLoop ? 'text-white' : 'text-gray-400'}`}>LOOP</Text>
                    </View>
                    <Text className={`text-xs font-black ${isLoop ? 'text-white' : 'text-brand-primary'}`}>₹{priceLoop}</Text>
                </TouchableOpacity>
            </View>

            {/* Add Button */}
            {isInStock ? (
                <TouchableOpacity onPress={handleAction} className={`mt-3 border py-3 rounded-2xl flex-row items-center justify-center ${isLoop ? 'bg-brand-primary border-brand-primary' : 'bg-brand-primary/10 border-brand-primary/30'}`}>
                    {isLoop ? <Users size={18} color="#FFFFFF" /> : <Plus size={18} color="#5A189A" />}
                    <Text className={`font-black ml-2 ${isLoop ? 'text-white' : 'text-brand-primary'}`}>
                        {isLoop ? 'JOIN LOOP' : 'ADD SOLO'}
                    </Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity 
                    onPress={() => {
                        if (!hasVoted) {
                            setHasVoted(true);
                            setVotes(v => v + 1);
                            showNotification(`Voted to restock ${name}!`, "success");
                        }
                    }}
                    className={`mt-3 py-3 rounded-2xl flex-row items-center justify-center shadow-sm ${hasVoted ? 'bg-orange-100 border border-orange-300' : 'bg-[#FFF9E6] border border-[#FFD966]'}`}
                >
                    <Text className={`font-black text-xs ${hasVoted ? 'text-orange-600' : 'text-[#D97706]'}`}>
                        {hasVoted ? `🔥 VOTED! (${votes})` : `🔥 VOTE TO RESTOCK (${votes})`}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};
