import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, LayoutAnimation, Platform, UIManager } from 'react-native';
import { ChevronLeft, Search, HelpCircle, MessageCircle, Phone, Mail, ChevronDown, ChevronUp, Package, CreditCard, User, LifeBuoy } from 'lucide-react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQS = [
    {
        id: '1',
        category: 'Orders',
        question: 'Where is my order?',
        answer: 'You can track your order in real-time on the "Track Order" screen available immediately after checkout or from your profile.',
        icon: Package
    },
    {
        id: '2',
        category: 'Payments',
        question: 'What payment methods do you accept?',
        answer: 'We accept all major Credit/Debit cards, UPI, and Digital Wallets like Paytm and PhonePe.',
        icon: CreditCard
    },
    {
        id: '3',
        category: 'Refunds',
        question: 'How do I get a refund?',
        answer: 'If you are unsatisfied with an item, you can report it within 24 hours. Refunds are processed within 3-5 business days.',
        icon: LifeBuoy
    },
    {
        id: '4',
        category: 'Account',
        question: 'How do I change my delivery address?',
        answer: 'Go to Profile > Delivery Addresses to add, edit or delete your saved locations.',
        icon: User
    }
];

export const SupportScreen = ({ navigation }: any) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

    const toggleFaq = (id: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedFaq(expandedFaq === id ? null : id);
    };

    const filteredFaqs = FAQS.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        faq.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View className="flex-1 bg-ui-background">
            {/* Header */}
            <View className="px-4 py-6 pt-12 flex-row items-center border-b border-gray-100 bg-white shadow-sm z-10">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                    <ChevronLeft size={28} color="#5A189A" />
                </TouchableOpacity>
                <View>
                    <Text className="text-text-primary font-black text-xl">HELP CENTER</Text>
                    <Text className="text-text-secondary font-bold text-[10px] uppercase tracking-widest">How can we help you today?</Text>
                </View>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Search Bar */}
                <View className="p-6">
                    <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 shadow-inner">
                        <Search size={20} color="#9CA3AF" />
                        <TextInput
                            className="flex-1 ml-3 font-medium text-text-primary"
                            placeholder="Search for questions..."
                            placeholderTextColor="#9CA3AF"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                {/* Contact Options */}
                <View className="px-6 mb-8 flex-row justify-between">
                    {[
                        { label: 'Live Chat', icon: MessageCircle, color: '#5A189A', bg: 'bg-purple-50' },
                        { label: 'Call Us', icon: Phone, color: '#10B981', bg: 'bg-green-50' },
                        { label: 'Email', icon: Mail, color: '#3B82F6', bg: 'bg-blue-50' },
                    ].map((item, i) => (
                        <TouchableOpacity key={i} className={`w-[30%] ${item.bg} p-4 rounded-3xl items-center border border-black/5`}>
                            <item.icon size={24} color={item.color} />
                            <Text className="text-[10px] font-black mt-2 text-text-primary uppercase tracking-tighter">{item.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* FAQ Section */}
                <View className="px-6 mb-10">
                    <Text className="text-text-primary font-black text-lg mb-4">Frequently Asked Questions</Text>
                    {filteredFaqs.map((faq) => {
                        const isExpanded = expandedFaq === faq.id;
                        return (
                            <TouchableOpacity 
                                key={faq.id} 
                                onPress={() => toggleFaq(faq.id)}
                                className={`bg-white border ${isExpanded ? 'border-brand-primary' : 'border-gray-100'} rounded-3xl p-5 mb-3 shadow-sm`}
                            >
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center flex-1 pr-4">
                                        <View className={`w-8 h-8 rounded-xl items-center justify-center mr-3 ${isExpanded ? 'bg-brand-primary' : 'bg-gray-50'}`}>
                                            <faq.icon size={16} color={isExpanded ? '#FFF' : '#5A189A'} />
                                        </View>
                                        <Text className={`font-bold text-sm flex-1 ${isExpanded ? 'text-brand-primary' : 'text-text-primary'}`}>{faq.question}</Text>
                                    </View>
                                    {isExpanded ? <ChevronUp size={18} color="#5A189A" /> : <ChevronDown size={18} color="#9CA3AF" />}
                                </View>
                                {isExpanded && (
                                    <View className="mt-4 pt-4 border-t border-gray-50">
                                        <Text className="text-text-secondary text-xs leading-5 font-medium">{faq.answer}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Community Link */}
                <TouchableOpacity 
                    onPress={() => navigation.navigate('NeighborhoodPulse')}
                    className="mx-6 p-6 rounded-[32px] bg-brand-primary flex-row items-center justify-between overflow-hidden shadow-lg shadow-brand-primary/40"
                >
                    <View className="flex-1 pr-4">
                        <Text className="text-white font-black text-lg">Ask the Neighbors</Text>
                        <Text className="text-white/80 text-xs font-bold mt-1">Get real-time shopping tips from people in your hub.</Text>
                    </View>
                    <View className="bg-white/20 p-3 rounded-2xl">
                        <MessageCircle size={24} color="#FFF" />
                    </View>
                </TouchableOpacity>

                <View className="h-20" />
            </ScrollView>
        </View>
    );
};
