import React from 'react';
import { View, Text, Platform } from 'react-native';

export default function Map({ initialRegion, children, style }: any) {
    if (Platform.OS === 'web') {
        const { latitude, longitude } = initialRegion || { latitude: 12.9716, longitude: 77.5946 };
        return (
            <View style={style} className="bg-gray-100 items-center justify-center">
                <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0" style={{ border: 0 }}
                    src={`https://www.google.com/maps/embed/v1/view?key=YOUR_API_KEY&center=${latitude},${longitude}&zoom=15`}
                    allowFullScreen
                ></iframe>
                <View className="absolute bottom-2 right-2 bg-white/80 px-2 py-1 rounded-md border border-gray-300">
                    <Text className="text-[8px] font-bold text-gray-500">WEB MAP PREVIEW</Text>
                </View>
            </View>
        );
    }

    // Dynamic import for native to avoid bundling errors on web
    const MapView = require('react-native-maps').default;
    const Marker = require('react-native-maps').Marker;

    return (
        <MapView
            style={style}
            initialRegion={initialRegion}
        >
            {children}
        </MapView>
    );
}

export const Marker = ({ children }: any) => {
    if (Platform.OS === 'web') return null;
    const { Marker: NativeMarker } = require('react-native-maps');
    return <NativeMarker>{children}</NativeMarker>;
};
