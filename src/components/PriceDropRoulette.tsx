import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Timer, TrendingDown, ShoppingCart, Sparkles, Gift } from 'lucide-react-native';
import { useCart } from '../lib/CartContext';
import { useNotification } from '../lib/NotificationContext';

export const PriceDropRoulette = () => {
    const { addToCart, getCartTotal } = useCart();
    const { showNotification } = useNotification();
    
    const initialPrice = 899;
    const floorPrice = 499;
    const [currentPrice, setCurrentPrice] = useState(initialPrice);
    const [isLocked, setIsLocked] = useState(false);
    const [showWheel, setShowWheel] = useState(false);
    const [isSpinning, setIsSpinning] = useState(false);
    
    // Simulate stock
    const [stockLeft, setStockLeft] = useState(3);
    const cartTotal = getCartTotal();

    useEffect(() => {
        if (isLocked || stockLeft === 0) return;

        const timer = setInterval(() => {
            setCurrentPrice((prev) => {
                if (prev <= floorPrice) {
                    clearInterval(timer);
                    return prev;
                }
                return prev - 1;
            });

            // Randomly drop stock to create panic
            if (Math.random() > 0.95 && stockLeft > 0) {
                setStockLeft(prev => prev - 1);
            }
        }, 1000); // Drops ₹1 every second

        return () => clearInterval(timer);
    }, [isLocked, stockLeft]);

    const handleLockIn = () => {
        if (stockLeft === 0) return;
        
        setIsLocked(true);
        addToCart({
            id: 999, // Unique ID for roulette item
            name: "Premium Artisanal Coffee Bean Bag",
            price: currentPrice,
            qty: 1,
            type: "Solo"
        });
        showNotification(`Locked in at ₹${currentPrice}! Added to cart.`, "success");
    };

    const handleSpin = () => {
        setIsSpinning(true);
        setTimeout(() => {
            setIsSpinning(false);
            setShowWheel(false);
            addToCart({
                id: 1111,
                name: "Mystery Gift: Dark Chocolate Bar",
                price: 0,
                qty: 1,
                type: "Solo"
            });
            showNotification("YOU WON! Dark Chocolate added to your cart for ₹0 🎁", "success");
        }, 2000);
    };

    if (stockLeft === 0) {
        return (
            <View className="mx-4 mt-6 bg-gray-100 border border-gray-200 p-4 rounded-3xl items-center justify-center">
                <Text className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-1">Price Drop Roulette</Text>
                <Text className="text-gray-500 font-black text-lg">SOLD OUT</Text>
            </View>
        );
    }

    return (
        <View className="mx-4 mt-6 bg-[#2B0E4C] border border-[#5A189A] p-5 rounded-3xl overflow-hidden shadow-lg shadow-brand-primary/30">
            {/* Modal for Spin the Wheel */}
            <Modal transparent visible={showWheel} animationType="fade">
                <View className="flex-1 bg-black/80 items-center justify-center p-6">
                    <View className="bg-white w-full max-w-sm rounded-[40px] p-8 items-center border-4 border-brand-primary">
                        <Gift size={64} color="#5A189A" />
                        <Text className="text-text-primary font-black text-3xl text-center mt-6 tracking-tighter">SPIN THE WHEEL!</Text>
                        <Text className="text-text-secondary text-center mt-2 font-bold leading-5">Thanks for spending ₹{cartTotal}! You've unlocked a guaranteed mystery gift.</Text>
                        
                        <TouchableOpacity 
                            onPress={handleSpin}
                            disabled={isSpinning}
                            className={`w-full mt-8 py-4 rounded-2xl items-center ${isSpinning ? 'bg-gray-200' : 'bg-brand-primary shadow-xl shadow-brand-primary/40'}`}
                        >
                            <Text className="text-white font-black text-lg uppercase">{isSpinning ? 'SPINNING...' : 'SPIN TO WIN'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Background design elements */}
            <View className="absolute -right-10 -top-10 w-40 h-40 bg-brand-primary/20 rounded-full blur-xl" />
            <View className="absolute -left-10 -bottom-10 w-32 h-32 bg-pink-500/20 rounded-full blur-xl" />

            <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center bg-black/30 px-3 py-1.5 rounded-full border border-white/10">
                    <TrendingDown size={14} color="#F472B6" />
                    <Text className="text-pink-400 font-black text-[10px] uppercase ml-1.5 tracking-wider">Price Drop Live</Text>
                </View>
                <View className="flex-row items-center bg-red-500/20 px-3 py-1.5 rounded-full border border-red-500/30">
                    <Timer size={14} color="#EF4444" />
                    <Text className="text-red-400 font-black text-[10px] ml-1.5 uppercase">Only {stockLeft} left!</Text>
                </View>
            </View>

            <View className="flex-row justify-between items-end mb-5">
                <View className="flex-1">
                    <Text className="text-white/70 font-bold text-xs uppercase mb-1">Premium Item</Text>
                    <Text className="text-white font-black text-xl mb-1">Artisanal Coffee</Text>
                    <Text className="text-white/50 font-medium text-xs">Ethiopian Yirgacheffe • 250g</Text>
                </View>
                <View className="items-end">
                    <Text className="text-white/40 font-bold text-sm line-through mb-1">₹{initialPrice}</Text>
                    <View className="flex-row items-center">
                        <Text className="text-pink-400 font-bold text-lg mt-1 mr-1">₹</Text>
                        <Text className="text-white font-black text-5xl tracking-tighter tabular-nums">{currentPrice}</Text>
                    </View>
                </View>
            </View>

            <View className="flex-row gap-2">
                <TouchableOpacity 
                    onPress={handleLockIn}
                    disabled={isLocked}
                    className={`flex-1 py-3.5 rounded-2xl flex-row items-center justify-center ${isLocked ? 'bg-white/10 border border-white/20' : 'bg-pink-500 shadow-md'}`}
                >
                    {isLocked ? (
                        <Text className="text-white font-black text-[10px] uppercase tracking-widest">Price Locked</Text>
                    ) : (
                        <>
                            <ShoppingCart size={16} color="#FFF" className="mr-2" />
                            <Text className="text-white font-black text-sm uppercase">Lock Price</Text>
                        </>
                    )}
                </TouchableOpacity>

                {cartTotal >= 500 && (
                    <TouchableOpacity 
                        onPress={() => setShowWheel(true)}
                        className="bg-brand-secondary px-4 py-3.5 rounded-2xl flex-row items-center justify-center shadow-lg shadow-brand-secondary/40"
                    >
                        <Sparkles size={16} color="#FFF" />
                        <Text className="text-white font-black text-sm uppercase ml-2">Claim Gift</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

