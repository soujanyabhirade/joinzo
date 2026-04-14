import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { MapContainer, TileLayer, Marker as LeafletMarker, useMap } from 'react-leaflet';
import L from 'leaflet';

// Inject CSS dynamically to avoid Metro bundler issues with relative image paths in leaflet.css
if (typeof document !== 'undefined') {
    if (!document.getElementById('leaflet-css-link')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css-link';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
    }
}

const customIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Component to dynamically update map center
function ChangeView({ center }: { center: any }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView([center.latitude, center.longitude], map.getZoom());
        }
    }, [center, map]);
    return null;
}

export default function Map({ initialRegion, children, style, onRegionChangeComplete }: any) {
    const defaultCenter = initialRegion || { latitude: 12.9716, longitude: 77.5946 };

    return (
        <View style={style} className="bg-gray-100 overflow-hidden relative">
            <MapContainer 
                center={[defaultCenter.latitude, defaultCenter.longitude]} 
                zoom={15} 
                style={{ width: '100%', height: '100%', zIndex: 0 }}
                zoomControl={false}
            >
                {/* Modern light map tiles */}
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; OpenStreetMap'
                />
                
                <ChangeView center={initialRegion} />
                
                {children}

                {/* Event listener dummy component for drag ends */}
                {onRegionChangeComplete && <MapEventsHandler onRegionChangeComplete={onRegionChangeComplete} />}
            </MapContainer>
            
            <View className="absolute bottom-2 right-2 bg-white/90 px-2 py-1 rounded-md border border-gray-200 z-[1000] pointer-events-none">
                <Text className="text-[8px] font-black text-brand-primary uppercase tracking-widest">Free Maps</Text>
            </View>
        </View>
    );
}

// Custom handler for drag events
function MapEventsHandler({ onRegionChangeComplete }: { onRegionChangeComplete: any }) {
    const map = useMap();
    useEffect(() => {
        const onMoveEnd = () => {
            const center = map.getCenter();
            onRegionChangeComplete({
                latitude: center.lat,
                longitude: center.lng,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01
            });
        };
        map.on('moveend', onMoveEnd);
        return () => { map.off('moveend', onMoveEnd); };
    }, [map, onRegionChangeComplete]);
    return null;
}

export const Marker = ({ coordinate, title, children }: any) => {
    if (!coordinate || typeof window === 'undefined') return null;
    
    // If it has children (custom icon like truck)
    if (children) {
        const iconHtml = `
        <div style="display:flex; justify-content:center; align-items:center;">
          <div style="background:#5A189A; padding:6px; border-radius:50%; border:2px solid white; box-shadow:0px 4px 6px rgba(0,0,0,0.3);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
               <path d="M10 17h4V5H2v12h3"></path><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5"></path><path d="M14 17h1"></path><circle cx="7.5" cy="17.5" r="2.5"></circle><circle cx="17.5" cy="17.5" r="2.5"></circle>
            </svg>
          </div>
        </div>`;
        const divIcon = new L.DivIcon({
            html: iconHtml,
            className: 'custom-leaflet-marker',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
        
        return <LeafletMarker position={[coordinate.latitude, coordinate.longitude]} icon={divIcon} />;
    }
    
    return (
        <LeafletMarker 
            position={[coordinate.latitude, coordinate.longitude]} 
            icon={customIcon}
        >
        </LeafletMarker>
    );
};
