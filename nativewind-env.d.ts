/// <reference types="nativewind/types" />
import * as LucideIcons from "lucide-react-native";

declare module "react-native" {
    interface ViewProps {
        className?: string;
    }
    interface TextProps {
        className?: string;
    }
    interface ImageProps {
        className?: string;
    }
    interface ScrollViewProps {
        className?: string;
    }
    interface TouchableOpacityProps {
        className?: string;
    }
}

declare module "react-native-safe-area-context" {
    interface SafeAreaViewProps {
        className?: string;
    }
}

declare module "lucide-react-native" {
    import { SvgProps } from "react-native-svg";
    export interface LucideProps extends SvgProps {
        size?: number | string;
        color?: string;
        strokeWidth?: number | string;
        className?: string;
    }
}
