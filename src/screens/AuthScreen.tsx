import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';
import { Mail, Lock, Zap } from 'lucide-react-native';

export const AuthScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(true);

    const handleAuth = async () => {
        setLoading(true);
        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                Alert.alert("Success", "Check your email for the login link!");
            }
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} className="bg-deep-charcoal p-6">
            <View className="items-center mb-12">
                <View className="flex-row items-center">
                    <Text className="text-neon-green font-black text-5xl tracking-tighter">JOINZO</Text>
                    <Zap size={36} color="#39FF14" fill="#39FF14" className="ml-1" />
                </View>
                <Text className="text-gray-400 font-bold mt-2">Quick Commerce & Social Buying</Text>
            </View>

            <View className="bg-soft-gray p-6 rounded-3xl border border-gray-800">
                <Text className="text-white font-black text-2xl mb-6">{isLogin ? 'Welcome Back' : 'Create Account'}</Text>

                <View className="mb-4">
                    <Text className="text-gray-400 font-bold text-xs mb-2 ml-1">EMAIL</Text>
                    <View className="flex-row items-center bg-deep-charcoal border border-gray-700 rounded-2xl px-4 py-3">
                        <Mail size={20} color="#9CA3AF" />
                        <TextInput
                            className="flex-1 ml-3 text-white font-medium"
                            placeholder="you@example.com"
                            placeholderTextColor="#6B7280"
                            autoCapitalize="none"
                            keyboardType="email-address"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>
                </View>

                <View className="mb-6">
                    <Text className="text-gray-400 font-bold text-xs mb-2 ml-1">PASSWORD</Text>
                    <View className="flex-row items-center bg-deep-charcoal border border-gray-700 rounded-2xl px-4 py-3">
                        <Lock size={20} color="#9CA3AF" />
                        <TextInput
                            className="flex-1 ml-3 text-white font-medium"
                            placeholder="********"
                            placeholderTextColor="#6B7280"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>
                </View>

                <TouchableOpacity
                    onPress={handleAuth}
                    disabled={loading}
                    className="bg-neon-green py-4 rounded-2xl items-center flex-row justify-center"
                >
                    <Text className="text-deep-charcoal font-black text-lg">
                        {loading ? 'Processing...' : (isLogin ? 'SIGN IN' : 'SIGN UP')}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setIsLogin(!isLogin)}
                    className="mt-6 items-center"
                >
                    <Text className="text-gray-400 font-bold">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <Text className="text-neon-green underline">{isLogin ? 'Sign Up' : 'Sign In'}</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};
