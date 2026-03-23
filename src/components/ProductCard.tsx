import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, Alert, Platform, Linking, Animated } from 'react-native';
import { Plus, Users, Zap, Share2, Heart, ShoppingCart } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../lib/CartContext';
import { useNotification } from '../lib/NotificationContext';
import { ProductDetailModal } from './ProductDetailModal';

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
    const [isLoop, setIsLoop] = useState(false);
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

    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isLoop) {
            Animated.spring(progressAnim, {
                toValue: progressPercent,
                useNativeDriver: false,
                friction: 8,
                tension: 40
            }).start();
        }
    }, [isLoop]);

    const [showDetail, setShowDetail] = useState(false);

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
        const appLink = `https://joinzo.app/product/${id}`;
        const message = `Hey! Let's team up to buy ${name} at a loop discount on Joinzo for just ₹${priceLoop}! \n\nJoin here: ${appLink}`;
        if (Platform.OS === 'web') {
            window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
        } else {
            Linking.openURL(`whatsapp://send?text=${encodeURIComponent(message)}`).catch(() => {
                Alert.alert("WhatsApp Not Found", "Please install WhatsApp to share.");
            });
        }
    };

    const [imageError, setImageError] = useState(false);
    const fallbackImage = "https://images.unsplash.com/photo-1506617564039-2f3b650ad701?auto=format&fit=crop&q=80&w=800"; // Artistic fruit placeholder, NOT a shelf

    // ... handleAction ...

    return (
        <>
            <TouchableOpacity 
                activeOpacity={0.9}
                onPress={() => setShowDetail(true)}
                style={{ backdropFilter: 'blur(16px)' } as any} 
                className={`bg-white/80 border ${isInStock ? 'border-white/60' : 'border-white/20'} rounded-3xl p-4 w-[48%] mb-4 shadow-xl shadow-brand-primary/10 transition-transform duration-300 hover:-translate-y-1 z-10 overflow-visible`}
            >
                {/* 3D Glass Highlight */}
                <View className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-t-3xl pointer-events-none" />
                
                {/* Product Image */}
                <View
                    style={{ position: 'relative', height: 128, marginBottom: 12 }}
                    className={`bg-ui-background/50 rounded-2xl overflow-hidden border border-white/50 shadow-inner ${!isInStock ? 'opacity-40' : ''}`}
                >
                    {isExpiringSoon && (
                        <View className="absolute top-0 left-0 right-0 bg-red-500 py-1 items-center justify-center z-10 w-full">
                            <Text className="text-white text-[9px] font-black uppercase tracking-widest">🚨 SECONDS RACK - {Math.floor((id % 50) + 10)}M LEFT</Text>
                        </View>
                    )}
                    <Image
                        source={{ uri: (image && !imageError) ? image : fallbackImage }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                        onError={() => {
                            console.log(`Image load failed for ${name}: ${image}`);
                            setImageError(true);
                        }}
                    />
                    <View className="absolute top-2 left-2 bg-brand-primary px-2 py-0.5 rounded-md flex-row items-center">
                        <Zap size={10} color="#FFFFFF" fill="#FFFFFF" />
                        <Text className="text-[10px] font-black text-white uppercase ml-1">Speed</Text>
                    </View>
                    <TouchableOpacity 
                        onPress={(e) => { e.stopPropagation(); handleShare(); }} 
                        className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full shadow-sm"
                    >
                        <Share2 size={14} color="#5A189A" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={(e) => { e.stopPropagation(); toggleFavorite(id); }} 
                        className="absolute top-10 right-2 bg-white/80 p-1.5 rounded-full shadow-sm"
                    >
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
                            <Animated.View 
                                className="h-full bg-brand-primary rounded-full" 
                                style={{ 
                                    width: progressAnim.interpolate({
                                        inputRange: [0, 100],
                                        outputRange: ['0%', '100%']
                                    }) 
                                }} 
                            />
                        </View>
                    </View>
                )}

                {/* Active Loops Nearby Indicator */}
                {priceLoop > 0 && (
                    <View className="mt-3 mb-2 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100 self-start">
                        <Text className="text-brand-primary font-black text-[8px] uppercase tracking-tighter">🔥 {Math.floor(id % 3) + 1} Loops Active Nearby</Text>
                    </View>
                )}

                {/* Pricing Toggle */}
                <View className="flex-row items-center justify-between mt-4 bg-ui-background/40 p-1 rounded-xl border border-white/60 shadow-inner">
                    <TouchableOpacity
                        onPress={(e) => { e.stopPropagation(); setIsLoop(false); }}
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
                        onPress={(e) => { e.stopPropagation(); setIsLoop(true); }}
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
                    <TouchableOpacity 
                        onPress={(e) => { e.stopPropagation(); handleAction(); }} 
                        className={`mt-3 border py-3 rounded-2xl flex-row items-center justify-center ${isLoop ? 'bg-brand-primary border-brand-primary' : 'bg-brand-primary border-brand-primary'}`}
                    >
                        {isLoop ? <Users size={18} color="#FFFFFF" /> : <ShoppingCart size={18} color="#FFFFFF" />}
                        <Text className={`font-black ml-2 text-white`}>
                            {isLoop ? 'JOIN LOOP' : 'ADD TO CART'}
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity 
                        onPress={(e) => {
                            e.stopPropagation();
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
            </TouchableOpacity>

            <ProductDetailModal
                visible={showDetail}
                onClose={() => setShowDetail(false)}
                product={{ id, name, priceSolo, priceLoop, image, weight }}
                onAddToCart={(type) => {
                    if (type === 'Loop') {
                        navigation.navigate("CreateTeam", { productId: id, productName: name, loopPrice: priceLoop });
                    } else {
                        addToCart({ id, name, price: priceSolo, qty: 1, type: "Solo" });
                        showNotification(`Added ${name} for ₹${priceSolo}`, "success");
                    }
                    setShowDetail(false);
                }}
            />
        </>
    );
};
