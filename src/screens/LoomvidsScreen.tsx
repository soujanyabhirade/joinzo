import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions, FlatList, Animated } from 'react-native';
import { X, Heart, MessageCircle, Share2, ShoppingCart, Play, Home } from 'lucide-react-native';
import { useCart } from '../lib/CartContext';
import { useNotification } from '../lib/NotificationContext';

const { height, width } = Dimensions.get('window');

const MOCK_VIDEOS = [
    {
        id: 501,
        name: "Gorgon-Nuts Wasabi",
        price: 85,
        user: "@snackmaster_jay",
        caption: "These wasabi nuts actually clear your sinuses 👃🔥 #snackhack #wasabi",
        likes: "12.4k",
        comments: "842",
        image: "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?auto=format&fit=crop&q=80&w=600",
    },
    {
        id: 502,
        name: "Iced Hibiscus Tea",
        price: 65,
        user: "@fit_neha",
        caption: "Perfect alternative to sugar-loaded sodas. Super refreshing! 🌺❄️",
        likes: "8.2k",
        comments: "156",
        image: "https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&q=80&w=600",
    },
    {
        id: 503,
        name: "Avocado Toast Kit",
        price: 249,
        user: "@chef_tanmay",
        caption: "Everything you need for the perfect brunch in 10 mins. 🥑🍞",
        likes: "25k",
        comments: "1.2k",
        image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=600",
    }
];

export const LoomvidsScreen = ({ navigation }: any) => {
    const { addToCart } = useCart();
    const { showNotification } = useNotification();
    const [likedVideos, setLikedVideos] = useState<number[]>([]);

    const toggleLike = (id: number) => {
        setLikedVideos(prev => 
            prev.includes(id) ? prev.filter(vidId => vidId !== id) : [...prev, id]
        );
    };

    const handleAddToCart = (video: any) => {
        addToCart({
            id: video.id,
            name: video.name,
            price: video.price,
            qty: 1,
            type: "Solo"
        });
        showNotification(`${video.name} added from video! 🛒`, "success");
    };

    const renderVideoItem = ({ item }: { item: typeof MOCK_VIDEOS[0] }) => {
        const isLiked = likedVideos.includes(item.id);

        return (
            <View style={{ height, width }} className="bg-black relative">
                {/* Simulated Video (Static Image for Demo) */}
                <Image 
                    source={{ uri: item.image }} 
                    style={{ height, width }} 
                    className="opacity-80"
                    resizeMode="cover"
                />
                
                {/* Vignette Overlay */}
                <View className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />

                {/* UI Overlay */}
                <View className="absolute bottom-10 left-4 right-16">
                    <Text className="text-white font-black text-lg mb-1">{item.user}</Text>
                    <Text className="text-white/90 text-sm mb-4 leading-5">{item.caption}</Text>
                    
                    <View className="bg-white/10 self-start px-3 py-2 rounded-xl border border-white/20 flex-row items-center backdrop-blur-md">
                        <View className="mr-3">
                            <Text className="text-white font-black text-sm">{item.name}</Text>
                            <Text className="text-brand-primary font-black text-xs">₹{item.price}</Text>
                        </View>
                        <TouchableOpacity 
                            onPress={() => handleAddToCart(item)}
                            className="bg-brand-primary px-4 py-2 rounded-lg flex-row items-center"
                        >
                            <ShoppingCart size={14} color="#FFF" className="mr-2" />
                            <Text className="text-white font-black text-xs uppercase">BUY NOW</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Interaction Sidebar */}
                <View className="absolute right-4 bottom-24 items-center gap-6">
                    <TouchableOpacity onPress={() => toggleLike(item.id)} className="items-center">
                        <View className={`w-12 h-12 rounded-full items-center justify-center ${isLiked ? 'bg-red-500' : 'bg-white/10'}`}>
                            <Heart size={24} color="#FFF" fill={isLiked ? "#FFF" : "none"} />
                        </View>
                        <Text className="text-white text-[10px] font-bold mt-1">{item.likes}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="items-center">
                        <View className="w-12 h-12 bg-white/10 rounded-full items-center justify-center">
                            <MessageCircle size={24} color="#FFF" />
                        </View>
                        <Text className="text-white text-[10px] font-bold mt-1">{item.comments}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="items-center">
                        <View className="w-12 h-12 bg-white/10 rounded-full items-center justify-center">
                            <Share2 size={24} color="#FFF" />
                        </View>
                        <Text className="text-white text-[10px] font-bold mt-1">Share</Text>
                    </TouchableOpacity>
                </View>

                {/* Play Button Overlay */}
                <View className="absolute inset-0 items-center justify-center opacity-30 pointer-events-none">
                    <Play size={80} color="#FFF" fill="#FFF" />
                </View>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-black">
            {/* Header Overlay */}
            <View className="absolute top-12 left-0 right-0 px-6 flex-row justify-between items-center z-50">
                <Text className="text-white font-black text-2xl tracking-tighter">LOOM<Text className="text-brand-primary">VIDS</Text></Text>
                <TouchableOpacity 
                    onPress={() => navigation.navigate("Home")}
                    className="w-10 h-10 bg-white/20 rounded-full items-center justify-center border border-white/20"
                >
                    <Home size={20} color="#FFF" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={MOCK_VIDEOS}
                renderItem={renderVideoItem}
                keyExtractor={item => item.id.toString()}
                pagingEnabled
                showsVerticalScrollIndicator={false}
                snapToInterval={height}
                snapToAlignment="start"
                decelerationRate="fast"
            />
        </View>
    );
};
