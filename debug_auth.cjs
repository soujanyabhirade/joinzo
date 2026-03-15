require('dotenv/config');
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    console.log("Checking database connection...");
    
    // Check products
    const { data: pData, error: pError } = await supabase.from('products').select('*').limit(1);
    if (pError) {
        console.error("Products table error:", pError.message);
    } else {
        console.log("✅ Products table accessible");
    }

    // Check user_profiles
    const { data: uData, error: uError } = await supabase.from('user_profiles').select('*').limit(1);
    if (uError) {
        console.error("❌ user_profiles table error:", uError.message);
        if (uError.code === '42P01') {
            console.log("TIP: The 'user_profiles' table does not exist. Please run coins_schema.sql in the Supabase SQL Editor.");
        }
    } else {
        console.log("✅ user_profiles table accessible");
    }

    // Check auth
    console.log("Testing auth connection...");
    const { data: aData, error: aError } = await supabase.auth.getSession();
    if (aError) {
        console.error("Auth error:", aError.message);
    } else {
        console.log("✅ Auth system reachable");
    }
}

check();
