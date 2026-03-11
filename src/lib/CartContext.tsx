import React, { createContext, useState, useContext } from 'react';

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

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

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

    const [favorites, setFavorites] = useState<number[]>([]);

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
