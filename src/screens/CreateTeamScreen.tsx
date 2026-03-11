import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { MapPin, Users, ArrowRight } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

export const CreateTeamScreen = ({ navigation }: any) => {
    const { user } = useAuth();
    const [teamName, setTeamName] = useState('');
    const [gateNumber, setGateNumber] = useState('');
    const [loading, setLoading] = useState(false);

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
            Alert.alert("Error Creating Loop", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} className="bg-deep-charcoal p-6">
            <View className="items-center mb-8">
                <View className="bg-neon-green/10 p-4 rounded-full mb-4 border border-neon-green/30">
                    <Users size={40} color="#39FF14" />
                </View>
                <Text className="text-white font-black text-3xl tracking-tight">START A LOOP</Text>
                <Text className="text-gray-400 text-center mt-2 px-4">Group orders together for bulk discounts and split delivery fees.</Text>
            </View>

            <View className="bg-soft-gray p-6 rounded-3xl border border-gray-800">
                <View className="mb-6">
                    <Text className="text-gray-400 font-bold text-xs mb-2 ml-1 uppercase">Loop Name</Text>
                    <TextInput
                        className="bg-deep-charcoal border border-gray-700 rounded-2xl px-4 py-4 text-white font-medium text-lg"
                        placeholder="e.g. Skyline Tower 3 Snacks"
                        placeholderTextColor="#6B7280"
                        value={teamName}
                        onChangeText={setTeamName}
                    />
                </View>

                <View className="mb-6">
                    <Text className="text-gray-400 font-bold text-xs mb-2 ml-1 uppercase">Delivery Hub (Gate/Lobby)</Text>
                    <View className="flex-row items-center bg-deep-charcoal border border-gray-700 rounded-2xl px-4 py-3">
                        <MapPin size={20} color="#39FF14" />
                        <TextInput
                            className="flex-1 ml-3 text-white font-medium text-lg"
                            placeholder="Gate 2"
                            placeholderTextColor="#6B7280"
                            value={gateNumber}
                            onChangeText={setGateNumber}
                        />
                    </View>
                </View>

                <TouchableOpacity
                    onPress={handleCreateTeam}
                    disabled={loading}
                    className="bg-neon-green py-4 rounded-2xl flex-row items-center justify-center mt-4"
                >
                    <Text className="text-deep-charcoal font-black text-lg mr-2">
                        {loading ? 'INITIALIZING...' : 'CONTINUE TO INVITES'}
                    </Text>
                    {!loading && <ArrowRight size={20} color="#121212" />}
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="py-4 mt-2 items-center justify-center"
                >
                    <Text className="text-gray-400 font-bold">Cancel</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};
