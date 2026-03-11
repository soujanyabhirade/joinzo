require('dotenv/config');
const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase. Requires URL and Service Role Key or Anon Key (if RLS is off)
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "https://mshyyegwrtblekolrcqu.supabase.co";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_Du8S9nlBX-t8hIuZ0MgEgA_hyn9s5zB";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const MOCK_PRODUCTS = [
    { name: "Lay's Classic Salted", price_solo: 20, price_loop: 18, image_url: "https://images.unsplash.com/photo-1599490659213-e2b9527f4280?w=400&q=80", weight: "50g", category: "Snacks", is_in_stock: true },
    { name: "Amul Taaza Toned Milk", price_solo: 27, price_loop: 25, image_url: "https://images.unsplash.com/photo-1550583724-b2692bcfff95?w=400&q=80", weight: "500ml", category: "Fresh", is_in_stock: true },
    { name: "Farm Fresh Eggs - 6 pcs", price_solo: 60, price_loop: 55, image_url: "https://images.unsplash.com/photo-1598965402089-8b09d22cc286?w=400&q=80", weight: "6 pcs", category: "Fresh", is_in_stock: true },
    { name: "Coca-Cola Original", price_solo: 40, price_loop: 38, image_url: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80", weight: "750ml", category: "Drinks", is_in_stock: true },
    { name: "Aashirvaad Shudh Chakki Atta", price_solo: 240, price_loop: 225, image_url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80", weight: "5kg", category: "Groceries", is_in_stock: true },
    { name: "Surf Excel Easy Wash", price_solo: 130, price_loop: 120, image_url: "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400&q=80", weight: "1kg", category: "Essentials", is_in_stock: true },
    { name: "Britannia Marie Gold", price_solo: 35, price_loop: 30, image_url: "https://images.unsplash.com/photo-1590080874088-eec64895b423?w=400&q=80", weight: "300g", category: "Snacks", is_in_stock: true },
    { name: "Thums Up Soft Drink", price_solo: 40, price_loop: 38, image_url: "https://images.unsplash.com/photo-1594971475674-6a97f8ecebd2?w=400&q=80", weight: "750ml", category: "Drinks", is_in_stock: true },
    { name: "Maggi 2-Minute Noodles", price_solo: 14, price_loop: 13, image_url: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&q=80", weight: "70g", category: "Groceries", is_in_stock: true },
    { name: "Duracell AA Batteries", price_solo: 170, price_loop: 160, image_url: "https://images.unsplash.com/photo-1584433305355-9cb73387fc61?w=400&q=80", weight: "Pack of 4", category: "Electronics", is_in_stock: false },
    { name: "Haldiram's Bhujia Sev", price_solo: 105, price_loop: 98, image_url: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&q=80", weight: "400g", category: "Snacks", is_in_stock: true },
    { name: "Onion - Medium", price_solo: 45, price_loop: 40, image_url: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&q=80", weight: "1kg", category: "Fresh", is_in_stock: true },
    { name: "Tomato - Hybrid", price_solo: 30, price_loop: 26, image_url: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80", weight: "1kg", category: "Fresh", is_in_stock: true },
    { name: "Potato - Local", price_solo: 35, price_loop: 30, image_url: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80", weight: "1kg", category: "Fresh", is_in_stock: true },
    { name: "Tropicana 100% Orange", price_solo: 110, price_loop: 105, image_url: "https://images.unsplash.com/photo-1622597467836-f38ec3170b79?w=400&q=80", weight: "1L", category: "Drinks", is_in_stock: true },
];

async function seed() {
    console.log("Seeding started...");

    // 1. Insert Categories
    const categoriesSet = new Set(MOCK_PRODUCTS.map(p => p.category));
    const categoriesData = Array.from(categoriesSet).map(name => ({ name }));

    const { data: insertedCategories, error: catError } = await supabase
        .from('categories')
        .upsert(categoriesData, { onConflict: 'name' })
        .select();

    if (catError) {
        console.error("Error inserting categories:", catError);
        // If error is about relation 'categories' does not exist, the user hasn't created the tables yet.
        return;
    }

    const categoryMap = insertedCategories.reduce((acc, cat) => {
        acc[cat.name] = cat.id;
        return acc;
    }, {});

    console.log("Categories seeded:", Object.keys(categoryMap).length);

    // 2. Insert Products
    for (const p of MOCK_PRODUCTS) {
        const { data: productData, error: prodError } = await supabase
            .from('products')
            .upsert({
                name: p.name,
                category_id: categoryMap[p.category],
                image_url: p.image_url,
                unit_weight: p.weight,
                mrp: p.price_solo,
                is_active: true
            }, { onConflict: 'name' })
            .select()
            .single();

        if (prodError) {
            console.error("Error inserting product", p.name, prodError);
            continue;
        }

        console.log(`Product seeded: ${p.name}`);
    }

    console.log("Seeding complete!");
}

seed().catch(console.error);
