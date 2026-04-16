import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { ChevronLeft, Send, Users, MessageSquare, Zap, MapPin } from 'lucide-react-native';
import { useAuth } from '../lib/AuthContext';
import { useNotification } from '../lib/NotificationContext';
import { supabase } from '../lib/supabase';

const MOCK_MESSAGES = [
    { id: '1', user: 'Rahul @ Gate 2', text: 'Anyone seen if the fresh mangoes are good today?', time: '2m ago', isMe: false },
    { id: '2', user: 'Sneha @ Gate 1', text: 'Yeah, just got them. Super juicy! 🥭', time: '1m ago', isMe: false },
    { id: '3', user: 'Amit @ Gate 2', text: 'Joining a milk loop if anyone wants a 30% discount!', time: 'Just now', isMe: false },
];

export const NeighborhoodPulseScreen = ({ navigation }: any) => {
    const { user } = useAuth();
    const { showNotification } = useNotification();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<any[]>(MOCK_MESSAGES);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const { data } = await supabase.from('neighborhood_pulse')
                    .select('*')
                    .order('created_at', { ascending: true })
                    .limit(50);
                if (data && data.length > 0) {
                    setMessages(data);
                }
            } catch(e) { console.error(e); }
        };
        fetchMessages();

        const channel = supabase.channel('pulse_updates')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'neighborhood_pulse' }, payload => {
                setMessages(prev => [...prev, payload.new]);
                setTimeout(() => { flatListRef.current?.scrollToEnd({ animated: true }); }, 200);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    const handleSend = async () => {
        if (!message.trim()) return;
        
        const tempId = Date.now().toString();
        const userName = user?.email ? user.email.split('@')[0] : 'Neighbor';
        
        const newMessage = {
            id: tempId,
            user: userName,
            text: message,
            time: 'Just now',
            isMe: true,
            user_id: user?.id
        };
        
        setMessages([...messages, newMessage]);
        setMessage('');
        setTimeout(() => { flatListRef.current?.scrollToEnd({ animated: true }); }, 100);

        try {
            await supabase.from('neighborhood_pulse').insert({
                user: userName,
                text: message,
                time: 'Just now',
                user_id: user?.id
            });
        } catch(e) {
            console.error(e);
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            className="flex-1 bg-ui-background"
        >
            {/* Header */}
            <View className="px-4 py-6 pt-12 flex-row items-center border-b border-gray-100 bg-white shadow-sm z-10">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                    <ChevronLeft size={28} color="#5A189A" />
                </TouchableOpacity>
                <View className="flex-1">
                    <View className="flex-row items-center">
                        <Text className="text-text-primary font-black text-xl">NEIGHBORHOOD PULSE</Text>
                        <View className="ml-2 bg-green-500 w-2 h-2 rounded-full animate-pulse" />
                    </View>
                    <View className="flex-row items-center">
                        <MapPin size={10} color="#6B7280" />
                        <Text className="text-text-secondary font-bold text-[10px] uppercase ml-1 tracking-widest">Live at Koramangala Hub</Text>
                    </View>
                </View>
                <View className="bg-brand-primary/10 px-3 py-1.5 rounded-full flex-row items-center border border-brand-primary/20">
                    <Users size={12} color="#5A189A" />
                    <Text className="text-brand-primary font-black text-[10px] ml-1">42 ONLINE</Text>
                </View>
            </View>

            {/* Chat Area */}
            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                className="flex-1 p-4"
                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={({ item }) => (
                    <View className={`mb-4 max-w-[85%] ${item.isMe ? 'self-end' : 'self-start'}`}>
                        {!item.isMe && (
                            <Text className="text-[10px] font-black text-brand-primary mb-1 ml-1 uppercase">{item.user}</Text>
                        )}
                        <View className={`p-4 rounded-3xl ${item.isMe ? 'bg-brand-primary rounded-tr-none' : 'bg-gray-100 rounded-tl-none border border-gray-200'}`}>
                            <Text className={`font-medium ${item.isMe ? 'text-white' : 'text-text-primary'}`}>{item.text}</Text>
                        </View>
                        <Text className="text-[8px] text-gray-400 mt-1 mr-1 text-right">{item.time}</Text>
                    </View>
                )}
            />

            {/* Input Area */}
            <View className="p-4 border-t border-gray-100 bg-white shadow-2xl">
                <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-1">
                    <TextInput
                        className="flex-1 py-3 text-text-primary font-medium"
                        placeholder="Say hi to your neighbors..."
                        placeholderTextColor="#9CA3AF"
                        value={message}
                        onChangeText={setMessage}
                        multiline
                    />
                    <TouchableOpacity 
                        onPress={handleSend}
                        className={`w-10 h-10 rounded-xl items-center justify-center ${message.trim() ? 'bg-brand-primary' : 'bg-gray-200'}`}
                        disabled={!message.trim()}
                    >
                        <Send size={18} color={message.trim() ? "#FFF" : "#9CA3AF"} />
                    </TouchableOpacity>
                </View>
                <Text className="text-center text-[9px] text-gray-400 mt-3 font-bold uppercase tracking-tighter">
                    Messages are ephemeral and vanish after 24 hours.
                </Text>
            </View>
        </KeyboardAvoidingView>
    );
};
