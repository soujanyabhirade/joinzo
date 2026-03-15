import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CartItem = {
    id: number;
    name: string;
    price: number;
    qty: number;
    type: "Solo" | "Loop";
};

type CartContextType = {
    cartItems: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: number) => void;
    getCartTotal: () => number;
    clearCart: () => void;
    favorites: number[];
    toggleFavorite: (id: number) => void;
};

const CART_STORAGE_KEY = '@joinzo_cart';
const FAV_STORAGE_KEY = '@joinzo_favorites';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [favorites, setFavorites] = useState<number[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load data from storage on mount
    useEffect(() => {
        const loadPersistedData = async () => {
            try {
                const savedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
                const savedFavs = await AsyncStorage.getItem(FAV_STORAGE_KEY);
                
                if (savedCart) setCartItems(JSON.parse(savedCart));
                if (savedFavs) setFavorites(JSON.parse(savedFavs));
            } catch (e) {
                console.error('Failed to load cart/favorites', e);
            } finally {
                setIsLoaded(true);
            }
        };
        loadPersistedData();
    }, []);

    // Save data whenever it changes
    useEffect(() => {
        if (!isLoaded) return;
        AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    }, [cartItems, isLoaded]);

    useEffect(() => {
        if (!isLoaded) return;
        AsyncStorage.setItem(FAV_STORAGE_KEY, JSON.stringify(favorites));
    }, [favorites, isLoaded]);

    const addToCart = (newItem: CartItem) => {
        setCartItems(prev => {
            const existing = prev.find(item => item.id === newItem.id && item.type === newItem.type);
            if (existing) {
                return prev.map(item =>
                    (item.id === newItem.id && item.type === newItem.type)
                        ? { ...item, qty: item.qty + newItem.qty }
                        : item
                );
            }
            return [...prev, newItem];
        });
    };

    const removeFromCart = (id: number) => {
        setCartItems(prev => prev.filter(item => item.id !== id));
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.qty), 0);
    };

    const clearCart = () => setCartItems([]);

    const toggleFavorite = (id: number) => {
        setFavorites(prev =>
            prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
        );
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, getCartTotal, clearCart, favorites, toggleFavorite }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
