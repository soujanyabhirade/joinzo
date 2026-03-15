const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://mshyyegwrtblekolrcqu.supabase.co";
const supabaseAnonKey = "sb_publishable_Du8S9nlBX-t8hIuZ0MgEgA_hyn9s5zB";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    try {
        const { data, error } = await supabase.from('products').select('*');
        if (error) {
            console.error("DB Error:", error);
        } else {
            console.log("ALL_PRODUCTS_START");
            console.log(JSON.stringify(data, null, 2));
            console.log("ALL_PRODUCTS_END");
        }
    } catch (e) {
        console.error("Connection Error:", e.message);
    }
}
check();
