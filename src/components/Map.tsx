import React from 'react';
import { View } from 'react-native';

// Use dynamic require so web doesn't crash before .web extension resolution
const MapView = require('react-native-maps').default;
const NativeMarker = require('react-native-maps').Marker;

export default function Map({ initialRegion, children, style, onRegionChangeComplete }: any) {
    return (
        <MapView
            style={style}
            initialRegion={initialRegion}
            onRegionChangeComplete={onRegionChangeComplete}
        >
            {children}
        </MapView>
    );
}

export const Marker = ({ coordinate, title, children }: any) => {
    return (
        <NativeMarker coordinate={coordinate} title={title}>
            {children}
        </NativeMarker>
    );
};
