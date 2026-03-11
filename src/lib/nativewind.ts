import { cssInterop } from "nativewind";
import { SafeAreaView } from "react-native-safe-area-context";
import * as LucideIcons from "lucide-react-native";

// Interop for SafeAreaView
cssInterop(SafeAreaView, {
    className: "style",
});

// Helper to apply interop to Lucide Icons
export function registerIcons(icons: string[]) {
    icons.forEach((iconName) => {
        const Icon = (LucideIcons as any)[iconName];
        if (Icon) {
            cssInterop(Icon, {
                className: {
                    target: "style",
                    nativeStyleToProp: {
                        color: "color",
                        fill: "fill",
                    },
                },
            });
        }
    });
}

// Initial registration of most used icons
registerIcons([
    "Zap", "MapPin", "ShoppingCart", "Plus", "Users",
    "ArrowRight", "Search", "Mic", "Copy", "Smartphone",
    "Clock", "CheckCircle", "Info", "ShoppingBag",
    "ChevronRight", "Truck", "ShieldCheck"
]);
