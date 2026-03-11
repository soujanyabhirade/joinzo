import React, { createContext, useContext, useState, useEffect } from 'react';
import { calculateDistanceMeters } from './location';

// Define some mockup Dark Stores (Warehouses)
export const WAREHOUSES = [
    { id: 'W1', name: 'Koramangala Dark Store', lat: 12.9352, lng: 77.6245 },
    { id: 'W2', name: 'Indiranagar Hub', lat: 12.9784, lng: 77.6408 },
    { id: 'W3', name: 'HSR Layout Mini', lat: 12.9121, lng: 77.6446 },
];

const MAX_DELIVERY_RADIUS_METERS = 3000; // 3km

interface LocationContextType {
    userLocation: { lat: number, lng: number } | null;
    setUserLocation: (loc: { lat: number, lng: number }) => void;
    activeWarehouse: typeof WAREHOUSES[0] | null;
    isServicable: boolean;
    distanceToWarehouse: number | null;
    savedAddresses: any[];
    addAddress: (addr: any) => void;
    deleteAddress: (id: string) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Default location (Say, somewhere in Koramangala, well within 3km of W1)
    const [userLocation, setUserLocation] = useState<{ lat: number, lng: number }>({ lat: 12.9340, lng: 77.6250 });
    const [activeWarehouse, setActiveWarehouse] = useState<typeof WAREHOUSES[0] | null>(null);
    const [distanceToWarehouse, setDistanceToWarehouse] = useState<number | null>(null);

    useEffect(() => {
        if (!userLocation) return;

        // Find nearest warehouse
        let nearest: typeof WAREHOUSES[0] | null = null;
        let minDistance = Infinity;

        WAREHOUSES.forEach(wh => {
            const dist = calculateDistanceMeters(userLocation.lat, userLocation.lng, wh.lat, wh.lng);
            if (dist < minDistance) {
                minDistance = dist;
                nearest = wh;
            }
        });

        if (nearest && minDistance <= MAX_DELIVERY_RADIUS_METERS) {
            setActiveWarehouse(nearest);
            setDistanceToWarehouse(Math.round(minDistance));
        } else {
            // Out of 3km radius = Not servicable
            setActiveWarehouse(null);
            setDistanceToWarehouse(Math.round(minDistance));
        }
    }, [userLocation]);

    const isServicable = activeWarehouse !== null;

    const [savedAddresses, setSavedAddresses] = useState<any[]>([
        { id: '1', title: 'Home', address: 'Flat 402, Green Glen Layout, Koramangala', lat: 12.9340, lng: 77.6250 },
        { id: '2', title: 'Office', address: 'Building 10, Embassy TechVillage, Devarabisanahalli', lat: 12.9275, lng: 77.6800 }
    ]);

    const addAddress = (addr: any) => setSavedAddresses(prev => [...prev, { ...addr, id: Date.now().toString() }]);
    const deleteAddress = (id: string) => setSavedAddresses(prev => prev.filter(a => a.id !== id));

    return (
        <LocationContext.Provider value={{
            userLocation,
            setUserLocation,
            activeWarehouse,
            isServicable,
            distanceToWarehouse,
            savedAddresses,
            addAddress,
            deleteAddress
        }}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocation = () => {
    const context = useContext(LocationContext);
    if (context === undefined) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
};
