const { createClient } = require("@supabase/supabase-js");

// Direct credentials for verification if .env is problematic in this shell context
const supabaseUrl = "https://mshyyegwrtblekolrcqu.supabase.co";
const supabaseAnonKey = "sb_publishable_Du8S9nlBX-t8hIuZ0MgEgA_hyn9s5zB";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    try {
        console.log("Checking connection...");
        const { data, error } = await supabase.from('products').select('*').limit(1);
        if (error) {
            console.error("DB Error:", error);
        } else {
            console.log("Sample product raw data:", data[0]);
            console.log("Columns:", Object.keys(data[0] || {}));
        }
    } catch (e) {
        console.error("Connection Type Error:", e.message);
    }
}
check();
