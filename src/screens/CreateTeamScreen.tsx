import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { MapPin, Users, ArrowRight, ChevronLeft } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

export const CreateTeamScreen = ({ route, navigation }: any) => {
    const { user } = useAuth();
    const [teamName, setTeamName] = useState('');
    const [gateNumber, setGateNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [showAutoMatch, setShowAutoMatch] = useState(true);

    // Deep link handling: If we arrived here via a loop/:teamId link
    const inviteTeamId = route.params?.teamId;
    const isJoiningInvite = inviteTeamId && !inviteTeamId.startsWith('mock-');

    const mockExistingLoops = [
        { id: 'm1', name: 'Tower A - Fresh Veggies', gate: 'Gate 1', members: 4, needed: 5 },
        { id: 'm2', name: 'Apartment 402 - Snacks', gate: 'Gate 2', members: 2, needed: 5 }
    ];

    const handleCreateTeam = async () => {
        if (!teamName || !gateNumber) {
            Alert.alert("Missing Details", "Please provide a loop name and delivery gate.");
            return;
        }

        if (!user) {
            Alert.alert("Not logged in", "You must be signed in to create a team.");
            return;
        }

        setLoading(true);
        try {
            // Check if it's a demo user (all zeros ID)
            const isDemoUser = user.id === '00000000-0000-0000-0000-000000000000';

            if (isDemoUser) {
                console.log("Demo session detected, bypassing database insert.");
                // Simulate a delay
                await new Promise(resolve => setTimeout(resolve, 800));
                navigation.navigate('ConnectContacts', { teamId: 'demo-' + Date.now(), teamName: teamName });
                return;
            }

            const { data, error } = await supabase
                .from('teams')
                .insert([
                    { name: teamName, gate_number: gateNumber, creator_id: user.id }
                ])
                .select()
                .single();

            if (error) throw error;

            // Success, navigate to Contacts to invite
            navigation.navigate('ConnectContacts', { teamId: data.id, teamName: data.name });

        } catch (error: any) {
            console.error("Team Creation Error:", error);
            Alert.alert(
                "Demo Mode Notice", 
                "We couldn't save your loop to the database (possibly due to demo account restrictions). We'll proceed with a temporary loop instead!",
                [{ text: "Continue", onPress: () => navigation.navigate('ConnectContacts', { teamId: 'fallback-' + Date.now(), teamName: teamName }) }]
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-ui-background">
            <View className="px-4 py-6 pt-12 flex-row items-center border-b border-gray-100 bg-white shadow-sm w-full">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                    <ChevronLeft size={28} color="#5A189A" />
                </TouchableOpacity>
                <Text className="text-text-primary font-black text-xl flex-1">TEAM BUY</Text>
            </View>

            <View className="p-6">
                {isJoiningInvite ? (
                    <View className="items-center py-10">
                        <View className="bg-brand-primary/10 p-8 rounded-full mb-6 border-2 border-brand-primary/30 shadow-xl shadow-brand-primary/5">
                            <Users size={64} color="#5A189A" />
                        </View>
                        <Text className="text-text-primary font-black text-3xl text-center tracking-tight">YOU'RE INVITED!</Text>
                        <Text className="text-text-secondary text-center mt-3 px-8 text-lg font-medium">Join the <Text className="text-brand-primary font-black">"{route.params?.teamName || 'Neighborhood'}"</Text> Loop and unlock collective bulk discounts!</Text>
                        
                        <View className="bg-indigo-50 p-6 rounded-[32px] mt-10 w-full border border-indigo-100 shadow-sm">
                            <Text className="text-indigo-900 font-black text-xs uppercase tracking-widest text-center mb-4">Loop Status</Text>
                            <View className="flex-row justify-around">
                                <View className="items-center">
                                    <Text className="text-text-primary font-black text-2xl">3/5</Text>
                                    <Text className="text-text-secondary text-[10px] font-bold uppercase">Members</Text>
                                </View>
                                <View className="items-center">
                                    <Text className="text-green-600 font-black text-2xl">30%</Text>
                                    <Text className="text-text-secondary text-[10px] font-bold uppercase">Discount</Text>
                                </View>
                            </View>
                        </View>

                        <TouchableOpacity 
                            onPress={() => {
                                Alert.alert("Success!", "You have joined the loop. Proceed to checkout to grab your discount!");
                                navigation.navigate('Checkout');
                            }}
                            className="bg-brand-primary w-full py-5 rounded-[24px] mt-10 flex-row items-center justify-center shadow-xl shadow-brand-primary/20"
                        >
                            <Text className="text-white font-black text-xl mr-2 uppercase tracking-tight">Join This Loop</Text>
                            <ArrowRight size={24} color="#FFF" />
                        </TouchableOpacity>

                        <TouchableOpacity 
                            onPress={() => navigation.navigate('Home')}
                            className="mt-6"
                        >
                            <Text className="text-text-secondary font-bold">Skip and browse catalog</Text>
                        </TouchableOpacity>
                    </View>
                ) : showAutoMatch ? (
                    <View className="mb-6 bg-indigo-50 p-6 rounded-[32px] border border-indigo-100 shadow-sm">
                        <View className="flex-row items-center mb-4">
                            <View className="bg-brand-primary w-8 h-8 rounded-full items-center justify-center">
                                <Users size={16} color="#FFF" />
                            </View>
                            <Text className="text-indigo-900 font-black text-xs ml-3 uppercase tracking-widest">Active Nearby Loops</Text>
                        </View>
                        <Text className="text-text-primary font-bold text-sm mb-4">We found existing teams for this product at your location!</Text>
                        
                        {mockExistingLoops.map(loop => (
                            <TouchableOpacity 
                                key={loop.id}
                                onPress={() => {
                                    Alert.alert("Joined Loop!", `You have joined ${loop.name}. Head to checkout to pay the Loop Price!`);
                                    navigation.navigate('Checkout');
                                }}
                                className="bg-white p-4 rounded-2xl mb-3 flex-row items-center justify-between border border-white/80 shadow-sm"
                            >
                                <View className="flex-1">
                                    <Text className="text-text-primary font-black text-sm">{loop.name}</Text>
                                    <Text className="text-text-secondary text-[10px] font-bold uppercase">{loop.gate} • {loop.members}/{loop.needed} MEMBERS</Text>
                                </View>
                                <View className="bg-brand-primary/10 px-3 py-1.5 rounded-xl border border-brand-primary/20">
                                    <Text className="text-brand-primary font-black text-[10px] uppercase">JOIN</Text>
                                </View>
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity onPress={() => setShowAutoMatch(false)} className="mt-2 items-center">
                            <Text className="text-indigo-600 font-black text-[10px] uppercase tracking-widest">Create New Instead</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <View className="items-center mb-8">
                            <View className="bg-brand-primary/10 p-4 rounded-full mb-4 border border-brand-primary/30">
                                <Users size={40} color="#5A189A" />
                            </View>
                            <Text className="text-text-primary font-black text-3xl tracking-tight">START A LOOP</Text>
                            <Text className="text-text-secondary text-center mt-2 px-4">Group orders together for bulk discounts and split delivery fees.</Text>
                        </View>

                        <View className="bg-ui-surface p-6 rounded-3xl border border-gray-200 shadow-sm">
                            <View className="mb-6">
                                <Text className="text-text-secondary font-bold text-xs mb-2 ml-1 uppercase">Loop Name</Text>
                                <TextInput
                                    className="bg-ui-background border border-gray-200 rounded-2xl px-4 py-4 text-text-primary font-medium text-lg"
                                    placeholder="e.g. Skyline Tower 3 Snacks"
                                    placeholderTextColor="#9CA3AF"
                                    value={teamName}
                                    onChangeText={setTeamName}
                                />
                            </View>

                            <View className="mb-6">
                                <Text className="text-text-secondary font-bold text-xs mb-2 ml-1 uppercase">Delivery Hub (Gate/Lobby)</Text>
                                <View className="flex-row items-center bg-ui-background border border-gray-200 rounded-2xl px-4 py-3">
                                    <MapPin size={20} color="#5A189A" />
                                    <TextInput
                                        className="flex-1 ml-3 text-text-primary font-medium text-lg"
                                        placeholder="Gate 2"
                                        placeholderTextColor="#9CA3AF"
                                        value={gateNumber}
                                        onChangeText={setGateNumber}
                                    />
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={handleCreateTeam}
                                disabled={loading}
                                className="bg-brand-primary py-4 rounded-2xl flex-row items-center justify-center mt-4"
                            >
                                <Text className="text-white font-black text-lg mr-2">
                                    {loading ? 'INITIALIZING...' : 'CONTINUE TO INVITES'}
                                </Text>
                                {!loading && <ArrowRight size={20} color="#FFFFFF" />}
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setShowAutoMatch(true)}
                                className="py-4 mt-2 items-center justify-center"
                            >
                                <Text className="text-text-secondary font-bold">Back to Suggestions</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </View>
        </ScrollView>
    );
};
