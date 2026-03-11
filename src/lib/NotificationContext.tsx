import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { View, Text, Animated, Platform } from 'react-native';
import { CheckCircle2, AlertCircle, Info, Users } from 'lucide-react-native';

type NotificationType = 'success' | 'error' | 'info' | 'loop';

interface Notification {
    id: number;
    message: string;
    type: NotificationType;
}

interface NotificationContextType {
    showNotification: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const showNotification = useCallback((message: string, type: NotificationType = 'info') => {
        const id = Date.now();
        setNotifications((prev) => [...prev, { id, message, type }]);

        // Auto-dismiss after 4 seconds
        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, 4000);
    }, []);

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            {/* Toast Display Logic */}
            <View style={{ position: 'absolute', top: 50, left: 20, right: 20, zIndex: 9999 }}>
                {notifications.map((n) => (
                    <NotificationToast key={n.id} message={n.message} type={n.type} />
                ))}
            </View>
        </NotificationContext.Provider>
    );
};

// Internal Helper Component for Animated Toast

const NotificationToast = ({ message, type }: { message: string, type: NotificationType }) => {
    const [fadeAnim] = useState(new Animated.Value(0));

    const isWeb = Platform.OS === 'web';

    React.useEffect(() => {
        Animated.sequence([
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: !isWeb }),
            Animated.delay(3000),
            Animated.timing(fadeAnim, { toValue: 0, duration: 400, useNativeDriver: !isWeb }),
        ]).start();
    }, [fadeAnim, isWeb]);

    const config = {
        success: { bg: 'bg-green-500', icon: CheckCircle2, color: '#FFFFFF' },
        error: { bg: 'bg-red-500', icon: AlertCircle, color: '#FFFFFF' },
        info: { bg: 'bg-brand-primary', icon: Info, color: '#FFFFFF' },
        loop: { bg: 'bg-purple-600', icon: Users, color: '#FFFFFF' },
    };

    const { bg, icon: Icon, color } = config[type];

    return (
        <Animated.View
            style={{ opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }}
            className={`${bg} p-4 rounded-2xl flex-row items-center mb-2 shadow-lg`}
        >
            <Icon size={20} color={color} />
            <Text className="text-white font-bold ml-3 flex-1">{message}</Text>
        </Animated.View>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotification must be used within a NotificationProvider');
    return context;
};
