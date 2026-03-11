import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import * as Contacts from 'expo-contacts';
import { Check, UserPlus, Home } from 'lucide-react-native';

export const ConnectContactsScreen = ({ route, navigation }: any) => {
    const [contacts, setContacts] = useState<Contacts.Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());

    // Optionally grab the newly created team details passed via navigation params
    const { teamName } = route.params || { teamName: "Skyline Snacks" };

    useEffect(() => {
        (async () => {
            const { status } = await Contacts.requestPermissionsAsync();
            if (status === 'granted') {
                const { data } = await Contacts.getContactsAsync({
                    fields: [Contacts.Fields.PhoneNumbers],
                    pageSize: 50
                });

                // Filter contacts that have valid names and phone numbers
                const validContacts = data.filter(c => c.firstName && c.phoneNumbers && c.phoneNumbers.length > 0);
                setContacts(validContacts);
            } else {
                Alert.alert("Permission Denied", "We need access to contacts to invite your neighbors!");
            }
            setLoading(false);
        })();
    }, []);

    const handleInvite = (contact: Contacts.Contact) => {
        // In a real app, this would trigger an SMS Deep link like `sms:${phone}?body=${msg}`
        // Or integrate with WhatsApp APIs. Here we simulate success.

        Alert.alert(
            "Invite Sent!",
            `Sent a WhatsApp invite to ${contact.firstName} to join the ${teamName} loop.`
        );

        const newSet = new Set(invitedIds);
        if (contact.id) newSet.add(contact.id);
        setInvitedIds(newSet);
    };

    const renderContact = ({ item }: { item: Contacts.Contact }) => {
        const isInvited = item.id && invitedIds.has(item.id);

        return (
            <View className="flex-row items-center justify-between bg-soft-gray p-4 mb-3 rounded-2xl border border-gray-800">
                <View>
                    <Text className="text-white font-bold text-lg">{item.firstName} {item.lastName || ''}</Text>
                    <Text className="text-gray-500 text-xs mt-1">
                        {item.phoneNumbers?.[0]?.number || 'No number'}
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() => !isInvited && handleInvite(item)}
                    disabled={isInvited}
                    className={`px-4 py-2 rounded-xl flex-row items-center ${isInvited ? 'bg-neon-green/20' : 'bg-neon-green'}`}
                >
                    {isInvited ? (
                        <>
                            <Check size={16} color="#39FF14" />
                            <Text className="text-neon-green font-bold ml-1">Invited</Text>
                        </>
                    ) : (
                        <>
                            <UserPlus size={16} color="#121212" />
                            <Text className="text-deep-charcoal font-black ml-1">Add</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-deep-charcoal">
            {/* Header */}
            <View className="px-6 py-6 pt-12 bg-deep-charcoal border-b border-gray-800 flex-row justify-between items-center">
                <View>
                    <Text className="text-neon-green font-black text-xs uppercase tracking-widest mb-1">Step 2: Spread the word</Text>
                    <Text className="text-white font-black text-2xl">Invite Neighbors</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate("Home")} className="bg-soft-gray p-3 rounded-full border border-gray-700">
                    <Home size={20} color="#39FF14" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <Text className="text-neon-green font-bold">Syncing contacts...</Text>
                </View>
            ) : (
                <FlatList
                    data={contacts}
                    keyExtractor={(c) => c.id || Math.random().toString()}
                    renderItem={renderContact}
                    className="p-4"
                    ListEmptyComponent={
                        <Text className="text-gray-400 text-center mt-10">No contacts found with phone numbers.</Text>
                    }
                    ListFooterComponent={<View className="h-20" />}
                />
            )}
        </View>
    );
};
