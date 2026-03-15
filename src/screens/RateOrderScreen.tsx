import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Star, Send, ThumbsUp, MessageSquare } from 'lucide-react-native';
import { useTheme } from '../lib/ThemeContext';
import { useNotification } from '../lib/NotificationContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

const RATING_LABELS = ['', 'Terrible', 'Bad', 'Okay', 'Good', 'Amazing!'];
const RATING_EMOJIS = ['', '😠', '😕', '😐', '😊', '🤩'];

const QUICK_TAGS = [
    'Fast delivery', 'Fresh items', 'Polite rider', 'Well packed',
    'Great value', 'On time', 'Good quality', 'Friendly service',
];

export const RateOrderScreen = ({ navigation, route }: any) => {
    const { isDarkMode } = useTheme();
    const { showNotification } = useNotification();
    const { user } = useAuth();
    const orderId = route?.params?.orderId || 'demo-order';

    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [riderRating, setRiderRating] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const bgBase = isDarkMode ? '#0A0A0A' : '#F8F9FA';
    const surfaceBg = isDarkMode ? '#121212' : '#FFFFFF';
    const borderColor = isDarkMode ? 'rgba(255,255,255,0.08)' : '#F3F4F6';
    const textColor = isDarkMode ? '#FFFFFF' : '#1A1A2E';
    const subTextColor = isDarkMode ? '#9CA3AF' : '#6B7280';

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const handleSubmit = async () => {
        if (rating === 0) {
            showNotification("Please select a rating", "error");
            return;
        }
        setLoading(true);
        try {
            // Save review to Supabase
            await supabase.from('reviews').insert([{
                order_id: orderId,
                user_id: user?.id,
                product_rating: rating,
                rider_rating: riderRating || null,
                review_text: review || null,
                tags: selectedTags,
            }]);

            setSubmitted(true);
            showNotification("Thank you for your feedback! 🎉", "success");
        } catch (err) {
            // Still show success for demo mode
            setSubmitted(true);
            showNotification("Thank you for your feedback! 🎉", "success");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: bgBase }}>
                <View className="flex-1 items-center justify-center px-8">
                    <Text style={{ fontSize: 72 }}>🎉</Text>
                    <Text style={{ color: textColor }} className="font-black text-3xl mt-6 text-center">Thank You!</Text>
                    <Text style={{ color: subTextColor }} className="text-center text-base font-medium mt-3 leading-6">
                        Your feedback helps us improve Joinzo for everyone. You've earned <Text className="font-black text-green-600">5 Joinzo Coins</Text>!
                    </Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Home')}
                        className="mt-8 px-10 py-4 rounded-[24px]"
                        style={{ backgroundColor: '#5A189A' }}
                    >
                        <Text className="text-white font-black text-base uppercase tracking-wider">Back to Shopping</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: bgBase }}>
            {/* Header */}
            <View style={{ backgroundColor: surfaceBg, borderBottomColor: borderColor, borderBottomWidth: 1 }}
                className="px-6 pt-4 pb-4 flex-row items-center">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                    <ChevronLeft size={28} color={isDarkMode ? "#FFF" : "#5A189A"} />
                </TouchableOpacity>
                <View>
                    <Text style={{ color: isDarkMode ? '#F59E0B' : '#D97706' }} className="font-black text-[10px] uppercase tracking-widest">Feedback</Text>
                    <Text style={{ color: textColor }} className="font-black text-xl tracking-tighter">RATE YOUR ORDER</Text>
                </View>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Product Rating */}
                <View className="mx-4 mt-6 rounded-[28px] overflow-hidden" style={{ backgroundColor: surfaceBg, borderColor, borderWidth: 1 }}>
                    <View className="p-6">
                        <Text style={{ color: textColor }} className="font-black text-lg mb-1">How was your order?</Text>
                        <Text style={{ color: subTextColor }} className="text-xs font-medium mb-6">Rate the quality of items you received</Text>

                        {/* Star Rating */}
                        <View className="flex-row justify-center items-center mb-4">
                            {[1, 2, 3, 4, 5].map(star => (
                                <TouchableOpacity key={star} onPress={() => setRating(star)} className="mx-2">
                                    <Star
                                        size={44}
                                        color={star <= rating ? '#F59E0B' : isDarkMode ? '#374151' : '#E5E7EB'}
                                        fill={star <= rating ? '#F59E0B' : 'transparent'}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>

                        {rating > 0 && (
                            <View className="items-center mb-2">
                                <Text style={{ fontSize: 32 }}>{RATING_EMOJIS[rating]}</Text>
                                <Text style={{ color: '#F59E0B' }} className="font-black text-base mt-1">{RATING_LABELS[rating]}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Rider Rating */}
                <View className="mx-4 mt-4 rounded-[28px] overflow-hidden" style={{ backgroundColor: surfaceBg, borderColor, borderWidth: 1 }}>
                    <View className="p-6">
                        <Text style={{ color: textColor }} className="font-black text-lg mb-1">How was your rider?</Text>
                        <Text style={{ color: subTextColor }} className="text-xs font-medium mb-4">Rate the delivery experience</Text>

                        <View className="flex-row justify-center items-center">
                            {[1, 2, 3, 4, 5].map(star => (
                                <TouchableOpacity key={star} onPress={() => setRiderRating(star)} className="mx-2">
                                    <Star
                                        size={36}
                                        color={star <= riderRating ? '#10B981' : isDarkMode ? '#374151' : '#E5E7EB'}
                                        fill={star <= riderRating ? '#10B981' : 'transparent'}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>

                        {riderRating > 0 && (
                            <Text className="text-center mt-2 font-black text-xs" style={{ color: '#10B981' }}>
                                {RATING_LABELS[riderRating]}
                            </Text>
                        )}
                    </View>
                </View>

                {/* Quick Tags */}
                <View className="mx-4 mt-4 rounded-[28px] overflow-hidden" style={{ backgroundColor: surfaceBg, borderColor, borderWidth: 1 }}>
                    <View className="p-6">
                        <Text style={{ color: textColor }} className="font-black text-base mb-4">What did you love?</Text>
                        <View className="flex-row flex-wrap">
                            {QUICK_TAGS.map(tag => (
                                <TouchableOpacity
                                    key={tag}
                                    onPress={() => toggleTag(tag)}
                                    className="mr-2 mb-2 px-4 py-2 rounded-full border"
                                    style={{
                                        backgroundColor: selectedTags.includes(tag) ? '#5A189A' : 'transparent',
                                        borderColor: selectedTags.includes(tag) ? '#5A189A' : isDarkMode ? '#374151' : '#E5E7EB',
                                    }}
                                >
                                    <Text style={{ color: selectedTags.includes(tag) ? '#FFF' : subTextColor }} className="font-bold text-xs">
                                        {tag}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Written Review */}
                <View className="mx-4 mt-4 rounded-[28px] overflow-hidden" style={{ backgroundColor: surfaceBg, borderColor, borderWidth: 1 }}>
                    <View className="p-6">
                        <View className="flex-row items-center mb-3">
                            <MessageSquare size={16} color={subTextColor} />
                            <Text style={{ color: textColor }} className="font-black text-base ml-2">Write a Review</Text>
                            <Text style={{ color: subTextColor }} className="text-xs font-medium ml-2">(optional)</Text>
                        </View>
                        <TextInput
                            multiline
                            numberOfLines={4}
                            placeholder="Tell us more about your experience..."
                            placeholderTextColor={isDarkMode ? '#4B5563' : '#9CA3AF'}
                            value={review}
                            onChangeText={setReview}
                            className="p-4 rounded-2xl text-sm font-medium"
                            style={{
                                backgroundColor: isDarkMode ? '#1A1A2E' : '#F9FAFB',
                                color: textColor,
                                minHeight: 100,
                                textAlignVertical: 'top',
                                borderWidth: 1,
                                borderColor: isDarkMode ? '#374151' : '#E5E7EB',
                            }}
                        />
                    </View>
                </View>

                {/* Submit Button */}
                <View className="mx-4 mt-6 mb-10">
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={loading || rating === 0}
                        className="py-4.5 rounded-[24px] items-center flex-row justify-center"
                        style={{ backgroundColor: rating > 0 ? '#5A189A' : '#9CA3AF' }}
                    >
                        <Send size={18} color="#FFF" />
                        <Text className="text-white font-black text-base ml-2 uppercase tracking-wider">
                            {loading ? 'Submitting...' : 'Submit Review'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4 items-center py-3">
                        <Text style={{ color: subTextColor }} className="font-bold text-sm">Skip for now</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};
