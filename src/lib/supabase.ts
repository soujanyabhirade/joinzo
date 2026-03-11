import { Platform } from "react-native";
if (Platform.OS !== "web") {
    require("react-native-url-polyfill/auto");
}
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Use environment variables for Supabase credentials. Ensure these are set in .env
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "https://mshyyegwrtblekolrcqu.supabase.co";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_Du8S9nlBX-t8hIuZ0MgEgA_hyn9s5zB";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
