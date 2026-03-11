import React from 'react';
import { View, Text } from 'react-native';

export default function Map({ children, style }: any) {
    return (
        <View style={[style, { backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }]}>
            {/* Embed a generic map iframe for visual aesthetics */}
            <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15555.239330107248!2d77.6146!3d12.9352!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDU2JzA2LjciTiA3N8KwMzcnMTMuMSJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0, position: 'absolute' }}
                allowFullScreen={false}
                loading="lazy"
            />
            {/* Overlay the children to let pins sit on top structurally if needed */}
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ backgroundColor: 'rgba(255,255,255,0.9)', padding: 8, borderRadius: 12, marginBottom: 40, elevation: 2 }}>
                    <Text style={{ color: '#5A189A', fontWeight: 'bold', fontSize: 12, textAlign: 'center' }}>Live Location Mockup</Text>
                </View>
                {children}
            </View>
        </View>
    );
}

export const Marker = ({ title, description }: any) => {
    return (
        <View style={{ padding: 8, backgroundColor: 'white', borderRadius: 12, borderWidth: 2, borderColor: '#5A189A', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3 }}>
            <Text style={{ color: '#1F2937', fontWeight: 'bold', fontSize: 12 }}>{title}</Text>
            {description && <Text style={{ color: '#6B7280', fontSize: 10 }}>{description}</Text>}
        </View>
    );
};
