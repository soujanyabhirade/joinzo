require('dotenv/config');
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "https://mshyyegwrtblekolrcqu.supabase.co";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_Du8S9nlBX-t8hIuZ0MgEgA_hyn9s5zB";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
    console.log("Checking products table...");

    // Fetch a single row to see the column structure
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(1);

    if (error) {
        console.error("Error fetching products:", error.message);
    } else {
        console.log("Products table structure (from first row):");
        if (data && data.length > 0) {
            console.log(Object.keys(data[0]));
            console.log("Sample data:", data[0]);
        } else {
            console.log("Table exists but is empty. We need to do a test insert to see schema or rely on REST API errors.");

            // Deliberate error to expose schema
            const { error: insertError } = await supabase
                .from('products')
                .insert([{ non_existent_column_12345: true }]);
            console.log("Insert Error:", insertError);
        }
    }
}

checkSchema();
