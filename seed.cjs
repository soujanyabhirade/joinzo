require('dotenv/config');
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const MOCK_PRODUCTS = [
  { name: "Alphonso Mangoes (1kg)", price_solo: 499, price_loop: 399, image_url: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=800", category: "Fresh", weight: "1kg" },
  { name: "Greek Yogurt (500g)", price_solo: 120, price_loop: 85, image_url: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=800", category: "Dairy", weight: "500g" },
  { name: "Premium Oreo Cookies", price_solo: 150, price_loop: 110, image_url: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&q=80&w=800", category: "Snacks", weight: "150g" },
  { name: "Classic Coca-Cola (2L)", price_solo: 95, price_loop: 75, image_url: "https://images.unsplash.com/photo-1622483767028-3f66f34a1074?auto=format&fit=crop&q=80&w=800", category: "Drinks", weight: "2L" },
  { name: "Organic Spinach", price_solo: 60, price_loop: 45, image_url: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80&w=800", category: "Fresh", weight: "250g" },
  { name: "Hass Avocados (2 units)", price_solo: 299, price_loop: 249, image_url: "https://images.unsplash.com/photo-1601039676563-f193ff3fbbb2?auto=format&fit=crop&q=80&w=800", category: "Fresh", weight: "2 units" },
  { name: "Artisan Sourdough", price_solo: 145, price_loop: 120, image_url: "https://images.unsplash.com/photo-1585478259715-876a23d1ffbb?auto=format&fit=crop&q=80&w=800", category: "Groceries", weight: "400g" },
  { name: "Organic Whole Milk (1L)", price_solo: 90, price_loop: 70, image_url: "https://images.unsplash.com/photo-1550583724-125581fe2f8a?auto=format&fit=crop&q=80&w=800", category: "Dairy", weight: "1L" }
];

async function seed() {
    console.log("Starting imagery-fix seed...");

    // 1. Clear existing products (Hard Reset)
    console.log("Cleaning stale product data...");
    const { error: deleteError } = await supabase.from('products').delete().neq('id', 0); // Delete all
    if (deleteError) console.error("Note: Partial delete failure:", deleteError.message);

    // 2. Ensure categories exist
    const categoriesSet = new Set(MOCK_PRODUCTS.map(p => p.category));
    for (const catName of categoriesSet) {
        await supabase.from('categories').upsert({ name: catName }, { onConflict: 'name' });
    }

    const { data: categories } = await supabase.from('categories').select('*');
    const catMap = categories.reduce((acc, c) => ({ ...acc, [c.name]: c.id }), {});

    // 3. Insert fresh products with new images
    for (const p of MOCK_PRODUCTS) {
        const { error: prodError } = await supabase.from('products').insert({
            name: p.name,
            price_solo: p.price_solo,
            price_loop: p.price_loop,
            image_url: p.image_url,
            category: p.category,
            weight: p.weight,
            is_in_stock: true
        });

        if (prodError) {
            console.error(`Failed to seed ${p.name}:`, prodError.message);
        } else {
            console.log(`Successfully seeded: ${p.name}`);
        }
    }

    console.log("Data successfully hard-reset with vibrant imagery! 🎉");
}

seed().catch(err => console.error("Fatal Seeding Error:", err));
