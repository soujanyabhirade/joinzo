import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { ChefHat, Plus } from 'lucide-react-native';
import { useCart } from '../lib/CartContext';
import { useNotification } from '../lib/NotificationContext';

const RECIPES = [
    {
        id: 'r1',
        title: "10-Min Creamy Pasta",
        image: "https://images.unsplash.com/photo-1621996316568-15822b39fb41?auto=format&fit=crop&q=80&w=400",
        prepTime: "10 mins",
        ingredients: [
            { id: 201, name: "Penne Pasta 500g", price: 80, type: "Solo" as const },
            { id: 202, name: "Cooking Cream 200ml", price: 65, type: "Solo" as const },
            { id: 203, name: "Parmesan Cheese", price: 250, type: "Solo" as const },
            { id: 204, name: "Garlic (100g)", price: 20, type: "Solo" as const }
        ]
    },
    {
        id: 'r2',
        title: "Movie Night Nachos",
        image: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&q=80&w=400",
        prepTime: "5 mins",
        ingredients: [
            { id: 301, name: "Tortilla Chips Family Pack", price: 150, type: "Solo" as const },
            { id: 302, name: "Jalapenos Slice Jar", price: 99, type: "Solo" as const },
            { id: 303, name: "Cheddar Cheese Block", price: 180, type: "Solo" as const },
            { id: 304, name: "Salsa Dip", price: 120, type: "Solo" as const }
        ]
    }
];

export const RecipeSection = () => {
    const { addToCart } = useCart();
    const { showNotification } = useNotification();

    const handleAddRecipe = (recipe: typeof RECIPES[0]) => {
        let totalItems = 0;
        recipe.ingredients.forEach(ingredient => {
            addToCart({ ...ingredient, qty: 1 });
            totalItems++;
        });
        showNotification(`Added ${totalItems} ingredients for ${recipe.title} to cart!`, "success");
    };

    return (
        <View className="mt-8 mb-4">
            <View className="px-4 flex-row items-center mb-4">
                <View className="w-8 h-8 rounded-full bg-brand-primary/10 items-center justify-center mr-2">
                    <ChefHat size={16} color="#5A189A" />
                </View>
                <View>
                    <Text className="text-text-primary font-black text-lg">Cook Tonight</Text>
                    <Text className="text-text-secondary font-bold text-xs uppercase tracking-widest mt-0.5">1-Tap Recipes</Text>
                </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
                {RECIPES.map((recipe) => (
                    <View key={recipe.id} className="bg-ui-surface rounded-3xl border border-gray-200 overflow-hidden w-64 mr-4 shadow-sm">
                        <Image source={{ uri: recipe.image }} className="w-full h-32 bg-gray-200" />
                        <View className="p-4">
                            <Text className="text-text-primary font-black text-lg mb-1">{recipe.title}</Text>
                            <Text className="text-text-secondary font-bold text-xs mb-3">{recipe.ingredients.length} Ingredients • {recipe.prepTime}</Text>
                            
                            <Text className="text-gray-400 text-[10px] font-bold uppercase mb-2">Includes:</Text>
                            <View className="flex-row flex-wrap mb-4">
                                {recipe.ingredients.slice(0, 3).map((ing, i) => (
                                    <Text key={ing.id} className="text-text-secondary text-[11px] font-medium mr-1 mb-1 bg-ui-background px-2 py-1 rounded-md border border-gray-100">
                                        {ing.name.substring(0, 15)}...
                                    </Text>
                                ))}
                            </View>

                            <TouchableOpacity 
                                onPress={() => handleAddRecipe(recipe)}
                                className="bg-brand-primary/10 border border-brand-primary/30 py-3 rounded-2xl flex-row items-center justify-center"
                            >
                                <Plus size={16} color="#5A189A" className="mr-1" />
                                <Text className="text-brand-primary font-black text-xs uppercase tracking-widest">Add All (₹{recipe.ingredients.reduce((a,b)=>a+b.price,0)})</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};
