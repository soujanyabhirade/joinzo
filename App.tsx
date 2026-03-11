import "./src/lib/nativewind";
import "./global.css";
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';

// Providers
import { AuthProvider, useAuth } from './src/lib/AuthContext';
import { CartProvider } from './src/lib/CartContext';
import { LocationProvider } from './src/lib/LocationContext';
import { NotificationProvider } from './src/lib/NotificationContext';

// Screens
import { AuthScreen } from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import { CheckoutScreen } from './src/screens/CheckoutScreen';
import { CreateTeamScreen } from './src/screens/CreateTeamScreen';
import { ConnectContactsScreen } from './src/screens/ConnectContactsScreen';
import { TrackOrderScreen } from './src/screens/TrackOrderScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { DiscoverScreen } from './src/screens/DiscoverScreen';
import { HeatmapScreen } from './src/screens/HeatmapScreen';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
    const { session, isLoading } = useAuth();

    if (isLoading) {
        return null; // Could return a Splash screen here
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {session ? (
                // User is signed in
                <>
                    <Stack.Screen name="Home" component={HomeScreen} />
                    <Stack.Screen name="Checkout" component={CheckoutScreen} />
                    <Stack.Screen name="CreateTeam" component={CreateTeamScreen} />
                    <Stack.Screen name="ConnectContacts" component={ConnectContactsScreen} />
                    <Stack.Screen name="TrackOrder" component={TrackOrderScreen} />
                    <Stack.Screen name="Profile" component={ProfileScreen} />
                    <Stack.Screen name="Discover" component={DiscoverScreen} />
                    <Stack.Screen name="Heatmap" component={HeatmapScreen} />
                </>
            ) : (
                // No session, require login
                <Stack.Screen name="Auth" component={AuthScreen} />
            )}
        </Stack.Navigator>
    );
};

export default function App() {
    return (
        <AuthProvider>
            <LocationProvider>
                <CartProvider>
                    <NotificationProvider>
                        <StatusBar barStyle="light-content" />
                        <NavigationContainer>
                            <RootNavigator />
                        </NavigationContainer>
                    </NotificationProvider>
                </CartProvider>
            </LocationProvider>
        </AuthProvider>
    );
}
