import "./src/lib/nativewind";
import "./global.css";
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import { StatusBar, Platform } from 'react-native';

// Providers
import { AuthProvider, useAuth } from './src/lib/AuthContext';
import { CartProvider } from './src/lib/CartContext';
import { LocationProvider } from './src/lib/LocationContext';
import { SecurityProvider } from './src/lib/SecurityContext';
import { NotificationProvider } from './src/lib/NotificationContext';
import { ThemeProvider } from './src/lib/ThemeContext';
import { CoinsProvider } from './src/lib/CoinsContext';

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
import { LoomvidsScreen } from './src/screens/LoomvidsScreen';
import { NeighborhoodPulseScreen } from './src/screens/NeighborhoodPulseScreen';
import { SupportScreen } from './src/screens/SupportScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { PaymentMethodsScreen } from './src/screens/PaymentMethodsScreen';
import { MyLoopsScreen } from './src/screens/MyLoopsScreen';
import { PartnerRegistrationScreen } from './src/screens/PartnerRegistrationScreen';
import { RiderRegistrationScreen } from './src/screens/RiderRegistrationScreen';
import { PartnerInventoryScreen } from './src/screens/PartnerInventoryScreen';
import { ReferralScreen } from './src/screens/ReferralScreen';
import { RiderDashboardScreen } from './src/screens/RiderDashboardScreen';
import { RateOrderScreen } from './src/screens/RateOrderScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import { OrderHistoryScreen } from './src/screens/OrderHistoryScreen';
import { AdminDashboardScreen } from './src/screens/AdminDashboardScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { JoinzoPlusScreen } from './src/screens/JoinzoPlusScreen';
import { BuildingSelectionScreen } from './src/screens/BuildingSelectionScreen';
import { PilotDashboard } from './src/screens/PilotDashboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { OfflineBanner } from './src/components/OfflineBanner';


const Stack = createNativeStackNavigator();

const prefix = Linking.createURL('/');

const linking = {
    prefixes: [prefix, 'https://joinzo.app'],
    config: {
        screens: {
            Home: '',
            CreateTeam: 'loop/:teamId',
            ConnectContacts: 'invite',
            Checkout: 'checkout',
            Profile: 'profile',
        },
    },
};

const RootNavigator = () => {
    const { session, isLoading } = useAuth();
    const [showOnboarding, setShowOnboarding] = React.useState<boolean | null>(null);

    React.useEffect(() => {
        const checkOnboarding = async () => {
            const complete = await AsyncStorage.getItem('@joinzo_onboarding_complete');
            setShowOnboarding(complete !== 'true');
        };
        checkOnboarding();
    }, []);

    if (isLoading || showOnboarding === null) {
        return null;
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {showOnboarding && session ? (
                <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            ) : null}
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
                    <Stack.Screen name="Loomvids" component={LoomvidsScreen} />
                    <Stack.Screen name="NeighborhoodPulse" component={NeighborhoodPulseScreen} />
                    <Stack.Screen name="Support" component={SupportScreen} />
                    <Stack.Screen name="Settings" component={SettingsScreen} />
                    <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
                    <Stack.Screen name="MyLoops" component={MyLoopsScreen} />
                    <Stack.Screen name="PartnerRegistration" component={PartnerRegistrationScreen} />
                    <Stack.Screen name="RiderRegistration" component={RiderRegistrationScreen} />
                    <Stack.Screen name="PartnerInventory" component={PartnerInventoryScreen} />
                    <Stack.Screen name="Referral" component={ReferralScreen} />
                    <Stack.Screen name="RiderDashboard" component={RiderDashboardScreen} />
                    <Stack.Screen name="RateOrder" component={RateOrderScreen} />
                    <Stack.Screen name="Notifications" component={NotificationsScreen} />
                    <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
                    <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
                    <Stack.Screen name="JoinzoPlus" component={JoinzoPlusScreen} />
                    <Stack.Screen name="BuildingSelection" component={BuildingSelectionScreen} />
        <Stack.Screen name="Pilot" component={PilotDashboard} />

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
        <SecurityProvider>
            <AuthProvider>
                <ThemeProvider>
                    <LocationProvider>
                        <CartProvider>
                            <CoinsProvider>
                                <NotificationProvider>
                                    <StatusBar barStyle="light-content" />
                                    <NavigationContainer>
                                        <ErrorBoundary>
                                            <OfflineBanner />
                                            <RootNavigator />
                                        </ErrorBoundary>
                                    </NavigationContainer>
                                </NotificationProvider>
                            </CoinsProvider>
                        </CartProvider>
                    </LocationProvider>
                </ThemeProvider>
            </AuthProvider>
        </SecurityProvider>
    );
}
