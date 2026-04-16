import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, Switch, Alert, Platform, Modal, ScrollView, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Plus, Package, Edit3, Trash2, ToggleLeft, ToggleRight, Search, Tag, IndianRupee, Box } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { useNotification } from '../lib/NotificationContext';
import { useTheme } from '../lib/ThemeContext';

interface Product {
    id: number;
    name: string;
    price_solo: number;
    price_loop: number;
    category: string;
    is_in_stock: boolean;
    image_url?: string;
}

const PRODUCT_CATEGORIES = ['Grocery', 'Snacks', 'Dairy & Eggs', 'Beverages', 'Bakery', 'Pharma', 'Personal Care'];

const ProductFormModal = ({ visible, product, onClose, onSave }: {
    visible: boolean;
    product: Product | null;
    onClose: () => void;
    onSave: (data: Partial<Product>) => void;
}) => {
    const [name, setName] = useState(product?.name || '');
    const [priceSolo, setPriceSolo] = useState(product?.price_solo?.toString() || '');
    const [priceLoop, setPriceLoop] = useState(product?.price_loop?.toString() || '');
    const [category, setCategory] = useState(product?.category || 'Grocery');
    const [imageUrl, setImageUrl] = useState(product?.image_url || '');
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => {
        if (product) {
            setName(product.name); setPriceSolo(product.price_solo.toString());
            setPriceLoop(product.price_loop.toString()); setCategory(product.category);
            setImageUrl(product.image_url || '');
        } else {
            setName(''); setPriceSolo(''); setPriceLoop(''); setCategory('Grocery'); setImageUrl('');
        }
    }, [product, visible]);

    const uploadImage = async (fileBody: Blob | File) => {
        setUploadingImage(true);
        try {
            const fileName = `${Date.now()}_img.jpg`;
            const { data, error } = await supabase.storage.from('product-images').upload(fileName, fileBody);
            if (error) throw error;
            
            const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
            setImageUrl(publicUrl);
        } catch (e: any) {
            Alert.alert("Upload Error", e.message);
        } finally {
            setUploadingImage(false);
        }
    };

    const pickImage = async () => {
        if (Platform.OS === 'web') {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = async (e: any) => {
                const file = e.target.files[0];
                if (file) await uploadImage(file);
            };
            input.click();
        } else {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled && result.assets[0]) {
                const response = await fetch(result.assets[0].uri);
                const blob = await response.blob();
                await uploadImage(blob);
            }
        }
    };

    const handleSave = () => {
        if (!name || !priceSolo) { Alert.alert("Error", "Name and Solo price are required."); return; }
        setSaving(true);
        onSave({ name, price_solo: Number(priceSolo), price_loop: Number(priceLoop || priceSolo), category, image_url: imageUrl });
        setSaving(false);
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <View className="flex-1 bg-ui-background">
                <View className="px-6 pt-8 pb-4 flex-row items-center justify-between border-b border-gray-100">
                    <Text className="font-black text-xl text-text-primary">{product ? 'Edit Product' : 'Add Product'}</Text>
                    <TouchableOpacity onPress={onClose} className="bg-gray-100 w-8 h-8 rounded-full items-center justify-center">
                        <Text className="font-black text-gray-600">✕</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView className="flex-1 p-6">
                    <View className="mb-5 items-center">
                        <TouchableOpacity 
                            onPress={pickImage} 
                            disabled={uploadingImage}
                            className="w-24 h-24 rounded-2xl bg-white border border-gray-200 items-center justify-center overflow-hidden shadow-sm"
                        >
                            {imageUrl ? (
                                <Image source={{ uri: imageUrl }} className="w-full h-full" />
                            ) : uploadingImage ? (
                                <ActivityIndicator color="#5A189A" />
                            ) : (
                                <View className="items-center">
                                    <Plus size={24} color="#9CA3AF" />
                                    <Text className="text-[10px] text-gray-400 mt-1 font-bold">PHOTO</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                    <Text className="text-xs font-black text-gray-400 uppercase tracking-[2px] mb-2 ml-1">Product Name *</Text>
                    <TextInput
                        className="bg-white border border-gray-100 p-5 rounded-3xl font-bold mb-5 shadow-sm"
                        placeholder="e.g. Amul Full Cream Milk 1L"
                        value={name} onChangeText={setName}
                    />
                    <View className="flex-row gap-4 mb-5">
                        <View className="flex-1">
                            <Text className="text-xs font-black text-gray-400 uppercase tracking-[2px] mb-2 ml-1">Solo Price (₹) *</Text>
                            <TextInput
                                className="bg-white border border-gray-100 p-5 rounded-3xl font-bold shadow-sm"
                                placeholder="68"
                                keyboardType="numeric"
                                value={priceSolo} onChangeText={setPriceSolo}
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-xs font-black text-gray-400 uppercase tracking-[2px] mb-2 ml-1">Loop Price (₹)</Text>
                            <TextInput
                                className="bg-white border border-gray-100 p-5 rounded-3xl font-bold shadow-sm"
                                placeholder="55 (group buy)"
                                keyboardType="numeric"
                                value={priceLoop} onChangeText={setPriceLoop}
                            />
                        </View>
                    </View>
                    <Text className="text-xs font-black text-gray-400 uppercase tracking-[2px] mb-3 ml-1">Category</Text>
                    <View className="flex-row flex-wrap gap-2 mb-8">
                        {PRODUCT_CATEGORIES.map(cat => (
                            <TouchableOpacity key={cat} onPress={() => setCategory(cat)}
                                className={`px-4 py-2.5 rounded-full border`}
                                style={{ backgroundColor: category === cat ? '#5A189A' : 'transparent', borderColor: category === cat ? '#5A189A' : '#E5E7EB' }}
                            >
                                <Text className={`text-xs font-black ${category === cat ? 'text-white' : 'text-text-primary'}`}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
                <View className="p-6">
                    <TouchableOpacity onPress={handleSave} disabled={saving}
                        className="py-5 rounded-[32px] items-center"
                        style={{ backgroundColor: saving ? '#9CA3AF' : '#5A189A' }}
                    >
                        <Text className="text-white font-black text-base uppercase tracking-wide">
                            {saving ? 'Saving...' : product ? 'Update Product' : 'Add to Inventory'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export const PartnerInventoryScreen = ({ navigation }: any) => {
    const { user } = useAuth();
    const { showNotification } = useNotification();
    const { isDarkMode } = useTheme();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [partnerInfo, setPartnerInfo] = useState<any>(null);

    const bgBase = isDarkMode ? '#0A0A0A' : '#F8F9FA';
    const surfaceBg = isDarkMode ? '#121212' : '#FFFFFF';
    const borderColor = isDarkMode ? 'rgba(255,255,255,0.1)' : '#F3F4F6';
    const textColor = isDarkMode ? '#FFFFFF' : '#1A1A2E';
    const subTextColor = isDarkMode ? '#9CA3AF' : '#6B7280';

    const fetchPartner = useCallback(async () => {
        const { data } = await supabase.from('partners').select('*').eq('user_id', user?.id).single();
        setPartnerInfo(data);
    }, [user?.id]);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('name');
        if (data) setProducts(data);
        if (error) console.error(error);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchPartner();
        fetchProducts();

        // Realtime subscription for live stock changes
        const channel = supabase.channel('partner-inventory')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
                fetchProducts();
            }).subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [fetchPartner, fetchProducts]);

    const handleSaveProduct = async (formData: Partial<Product>) => {
        try {
            if (editingProduct) {
                const { error } = await supabase.from('products').update(formData).eq('id', editingProduct.id);
                if (error) throw error;
                showNotification("Product updated!", "success");
            } else {
                const { error } = await supabase.from('products').insert([{ ...formData, is_in_stock: true }]);
                if (error) throw error;
                showNotification("Product added to inventory!", "success");
            }
            setIsModalVisible(false);
            fetchProducts();
        } catch (err: any) {
            showNotification(err.message || "Failed to save product.", "error");
        }
    };

    const handleToggleStock = async (product: Product) => {
        const { error } = await supabase.from('products').update({ is_in_stock: !product.is_in_stock }).eq('id', product.id);
        if (!error) {
            setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_in_stock: !p.is_in_stock } : p));
        }
    };

    const handleDelete = (product: Product) => {
        const doDelete = async () => {
            const { error } = await supabase.from('products').delete().eq('id', product.id);
            if (!error) {
                setProducts(prev => prev.filter(p => p.id !== product.id));
                showNotification("Product removed.", "info");
            }
        };
        if (Platform.OS === 'web') {
            if (window.confirm(`Remove "${product.name}" from inventory?`)) doDelete();
        } else {
            Alert.alert("Remove Product", `Remove "${product.name}"?`, [
                { text: "Cancel", style: "cancel" },
                { text: "Remove", style: "destructive", onPress: doDelete }
            ]);
        }
    };

    const filtered = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const inStockCount = products.filter(p => p.is_in_stock).length;
    const outOfStockCount = products.filter(p => !p.is_in_stock).length;

    const renderProduct = ({ item }: { item: Product }) => (
        <View style={{ backgroundColor: surfaceBg, borderColor, borderWidth: 1 }}
            className="p-4 rounded-3xl mb-3 shadow-sm flex-row items-center">
            
            <View className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 mr-4 items-center justify-center overflow-hidden">
                {item.image_url ? (
                    <Image source={{ uri: item.image_url }} className="w-full h-full" />
                ) : (
                    <Box size={24} color="#D1D5DB" />
                )}
            </View>

            <View className="flex-1 pr-3">
                <Text style={{ color: textColor }} className="font-black text-sm leading-5" numberOfLines={1}>{item.name}</Text>
                <View className="flex-row items-center mt-1.5 gap-3">
                    <View className="flex-row items-center">
                        <IndianRupee size={10} color="#5A189A" />
                        <Text className="text-brand-primary font-black text-sm">{item.price_solo}</Text>
                        <Text style={{ color: subTextColor }} className="text-xs font-medium ml-1">solo</Text>
                    </View>
                    {item.price_loop !== item.price_solo && (
                        <View className="flex-row items-center">
                            <IndianRupee size={10} color="#10B981" />
                            <Text className="text-green-600 font-black text-sm">{item.price_loop}</Text>
                            <Text style={{ color: subTextColor }} className="text-xs font-medium ml-1">loop</Text>
                        </View>
                    )}
                </View>
                <View className="mt-2 flex-row items-center">
                    <View style={{ backgroundColor: item.is_in_stock ? '#F0FDF4' : '#FEF2F2', borderColor: item.is_in_stock ? '#BBF7D0' : '#FECACA' }}
                        className="px-2 py-0.5 rounded-full border">
                        <Text style={{ color: item.is_in_stock ? '#15803D' : '#DC2626' }} className="text-[9px] font-black uppercase tracking-widest">
                            {item.is_in_stock ? '● In Stock' : '● Out of Stock'}
                        </Text>
                    </View>
                    <Text style={{ color: subTextColor }} className="text-[9px] font-bold ml-2 uppercase">{item.category}</Text>
                </View>
            </View>
            
            <View className="items-end justify-between py-1 gap-4">
                <Switch
                    value={item.is_in_stock}
                    onValueChange={() => handleToggleStock(item)}
                    trackColor={{ false: '#E5E7EB', true: '#5A189A' }}
                    thumbColor="#FFF"
                    style={{ transform: [{ scale: 0.8 }] }}
                />
                <View className="flex-row gap-2">
                    <TouchableOpacity onPress={() => { setEditingProduct(item); setIsModalVisible(true); }}
                        style={{ backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F3F4F6' }}
                        className="w-8 h-8 rounded-xl items-center justify-center">
                        <Edit3 size={14} color="#5A189A" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item)}
                        style={{ backgroundColor: '#FEF2F2' }}
                        className="w-8 h-8 rounded-xl items-center justify-center">
                        <Trash2 size={14} color="#DC2626" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: bgBase }}>
            {/* Header */}
            <View style={{ backgroundColor: surfaceBg, borderBottomColor: borderColor, borderBottomWidth: 1 }}
                className="px-6 pt-4 pb-4 flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                        <ChevronLeft size={28} color={isDarkMode ? "#FFF" : "#5A189A"} />
                    </TouchableOpacity>
                    <View>
                        <Text style={{ color: isDarkMode ? '#A78BFA' : '#5A189A' }} className="font-black text-[10px] uppercase tracking-widest">
                            {partnerInfo?.shop_name || 'Your Shop'}
                        </Text>
                        <Text style={{ color: textColor }} className="font-black text-xl tracking-tighter">INVENTORY</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={() => { setEditingProduct(null); setIsModalVisible(true); }}
                    className="w-11 h-11 rounded-2xl items-center justify-center"
                    style={{ backgroundColor: '#5A189A' }}>
                    <Plus size={22} color="#FFF" />
                </TouchableOpacity>
            </View>

            {/* Stats Row */}
            <View style={{ backgroundColor: surfaceBg, borderBottomColor: borderColor, borderBottomWidth: 1 }}
                className="flex-row px-6 py-4 gap-4">
                {[
                    { label: 'Total Items', value: products.length, color: '#5A189A' },
                    { label: 'In Stock', value: inStockCount, color: '#10B981' },
                    { label: 'Out of Stock', value: outOfStockCount, color: '#EF4444' },
                ].map(stat => (
                    <View key={stat.label} className="flex-1 items-center">
                        <Text className="font-black text-2xl" style={{ color: stat.color }}>{stat.value}</Text>
                        <Text className="text-[9px] font-black uppercase tracking-widest" style={{ color: subTextColor }}>{stat.label}</Text>
                    </View>
                ))}
            </View>

            {/* Search */}
            <View className="px-6 pt-4 pb-2">
                <View style={{ backgroundColor: surfaceBg, borderColor, borderWidth: 1 }}
                    className="flex-row items-center rounded-2xl px-4 py-3">
                    <Search size={18} color="#9CA3AF" />
                    <TextInput
                        className="flex-1 ml-3 font-medium"
                        placeholder="Search products..."
                        placeholderTextColor="#9CA3AF"
                        style={{ color: textColor }}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#5A189A" />
                    <Text style={{ color: subTextColor }} className="font-bold mt-3">Loading inventory...</Text>
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderProduct}
                    contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                    ListEmptyComponent={
                        <View className="flex-1 items-center justify-center mt-16">
                            <Box size={48} color="#D1D5DB" />
                            <Text style={{ color: subTextColor }} className="font-bold mt-4 text-center">No products yet.{'\n'}Tap + to add your first item!</Text>
                        </View>
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}

            <ProductFormModal
                visible={isModalVisible}
                product={editingProduct}
                onClose={() => setIsModalVisible(false)}
                onSave={handleSaveProduct}
            />
        </SafeAreaView>
    );
};
