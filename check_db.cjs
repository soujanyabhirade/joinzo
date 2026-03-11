require('dotenv/config');
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "https://mshyyegwrtblekolrcqu.supabase.co";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_Du8S9nlBX-t8hIuZ0MgEgA_hyn9s5zB";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDatabase() {
    console.log("Checking for 'warehouses' table...");
    const { error: wError } = await supabase.from('warehouses').select('id').limit(1);
    if (wError) console.error("Warehouses Table Error:", wError.message);
    else console.log("Warehouses Table: OK");

    console.log("Checking for 'warehouse_inventory' table...");
    const { error: wiError } = await supabase.from('warehouse_inventory').select('id').limit(1);
    if (wiError) console.error("Warehouse Inventory Table Error:", wiError.message);
    else console.log("Warehouse Inventory Table: OK");

    console.log("Checking for RPC 'get_serviceable_warehouse'...");
    // Just try to call it with a fake location
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_serviceable_warehouse', {
        user_lat: 12.9716,
        user_lng: 77.5946
    });
    if (rpcError) console.error("RPC Error:", rpcError.message);
    else console.log("RPC 'get_serviceable_warehouse': OK", rpcData);
}

checkDatabase().catch(console.error);
