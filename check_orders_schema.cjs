require('dotenv/config');
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "https://mshyyegwrtblekolrcqu.supabase.co";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_Du8S9nlBX-t8hIuZ0MgEgA_hyn9s5zB";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkOrderItems() {
    console.log("Checking for 'order_items' table...");
    const { error } = await supabase.from('order_items').select('id').limit(1);
    
    if (error) {
        if (error.message.includes('relation "public.order_items" does not exist')) {
            console.log("'order_items' table does NOT exist.");
        } else {
            console.error("Error checking 'order_items' table:", error.message);
        }
    } else {
        console.log("'order_items' table EXISTS.");
    }

    console.log("\nChecking 'orders' table structure...");
    const { data: orderData, error: orderError } = await supabase.from('orders').select('*').limit(1);
    if (orderError) {
        console.error("Error fetching orders:", orderError.message);
    } else if (orderData && orderData.length > 0) {
        console.log("Orders columns:", Object.keys(orderData[0]));
    } else {
        console.log("Orders table is empty.");
    }
}

checkOrderItems().catch(console.error);
