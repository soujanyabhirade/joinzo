-- ============================================================
-- JOINZO - Full Product Catalog Seed
-- Run this in your Supabase SQL Editor to add 50+ products
-- ============================================================

-- First, clear existing products (optional - comment out if you want to keep existing data)
-- DELETE FROM products;

INSERT INTO products (name, price_solo, price_loop, image_url, category, weight, is_in_stock) VALUES

-- ========== FRESH ==========
('Alphonso Mangoes (1kg)',       499, 399, 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&fit=crop&q=80', 'Fresh', '1kg',     true),
('Organic Spinach',              60,  45,  'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&fit=crop&q=80', 'Fresh', '250g',    true),
('Hass Avocados (Pack of 2)',    299, 249, 'https://images.unsplash.com/photo-1601039676563-f193ff3fbbb2?w=400&fit=crop&q=80', 'Fresh', '2 units', true),
('Red Onions (1kg)',             55,  40,  'https://images.unsplash.com/photo-1618512496248-a07fe83e4c44?w=400&fit=crop&q=80', 'Fresh', '1kg',     true),
('Tomatoes (500g)',              45,  32,  'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&fit=crop&q=80', 'Fresh', '500g',    true),
('Bananas (Dozen)',              60,  45,  'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=400&fit=crop&q=80', 'Fresh', '12 pcs',  true),
('Watermelon (whole)',           120, 90,  'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=400&fit=crop&q=80', 'Fresh', '2-3kg',   true),
('Broccoli (500g)',              90,  70,  'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&fit=crop&q=80', 'Fresh', '500g',    true),
('Sweet Corn (4 pcs)',           80,  60,  'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=400&fit=crop&q=80', 'Fresh', '4 pcs',   true),
('Strawberries (250g)',          199, 159, 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&fit=crop&q=80', 'Fresh', '250g',    true),

-- ========== DAIRY ==========
('Greek Yogurt (500g)',          120, 85,  'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&fit=crop&q=80', 'Dairy', '500g',    true),
('Full Cream Milk (1L)',         68,  55,  'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&fit=crop&q=80', 'Dairy', '1L',      true),
('Amul Butter (500g)',           240, 210, 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&fit=crop&q=80', 'Dairy', '500g',    true),
('Farm Fresh Eggs (12 pcs)',     120, 95,  'https://images.unsplash.com/photo-1582797493098-23d8d0cc6769?w=400&fit=crop&q=80', 'Dairy', '12 pcs',  true),
('Cheddar Cheese (200g)',        280, 230, 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&fit=crop&q=80', 'Dairy', '200g',    true),
('Paneer (200g)',                110, 85,  'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&fit=crop&q=80', 'Dairy', '200g',    true),

-- ========== SNACKS ==========
('Premium Oreo Cookies',        150, 110, 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&fit=crop&q=80', 'Snacks', '150g',   true),
('Digestive Biscuits',          40,  32,  'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&fit=crop&q=80', 'Snacks', '200g',   true),
('Lay''s Classic Salted',       30,  22,  'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&fit=crop&q=80', 'Snacks', '90g',    true),
('Sea Salt Dark Chocolate',     299, 240, 'https://images.unsplash.com/photo-1511381939415-e44aa117067b?w=400&fit=crop&q=80', 'Snacks', '100g',   true),
('Mixed Nuts & Raisins',        340, 280, 'https://images.unsplash.com/photo-1567586879816-39a8c4cd1f01?w=400&fit=crop&q=80', 'Snacks', '250g',   true),
('Popcorn Party Pack',          120, 90,  'https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=400&fit=crop&q=80', 'Snacks', '200g',   true),
('Pringles Sour Cream',         220, 170, 'https://images.unsplash.com/photo-1548041817-001f880124d8?w=400&fit=crop&q=80', 'Snacks', '165g',   true),
('Protein Granola Bar',         90,  70,  'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&fit=crop&q=80', 'Snacks', '50g',    true),

-- ========== DRINKS ==========
('Classic Coca-Cola (2L)',       95,  75,  'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&fit=crop&q=80', 'Drinks', '2L',     true),
('Sparkling Water (6-pack)',     180, 140, 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&fit=crop&q=80', 'Drinks', '6x500ml', true),
('Fresh Orange Juice (1L)',      150, 115, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&fit=crop&q=80', 'Drinks', '1L',     true),
('Green Tea (25 bags)',          180, 140, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&fit=crop&q=80', 'Drinks', '25 bags', true),
('Red Bull Energy Drink',       125, 99,  'https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=400&fit=crop&q=80', 'Drinks', '250ml',  true),
('Cold Brew Coffee (500ml)',    220, 175, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&fit=crop&q=80', 'Drinks', '500ml',  true),

-- ========== GROCERIES ==========
('Artisan Sourdough Bread',     145, 120, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&fit=crop&q=80', 'Groceries', '400g',  true),
('Basmati Rice (5kg)',           450, 380, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&fit=crop&q=80', 'Groceries', '5kg',   true),
('Toor Dal (1kg)',               160, 130, 'https://images.unsplash.com/photo-1602340875671-2b32d7fbdb63?w=400&fit=crop&q=80', 'Groceries', '1kg',   true),
('Extra Virgin Olive Oil',      550, 450, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&fit=crop&q=80', 'Groceries', '500ml', true),
('Whole Wheat Pasta (500g)',    180, 140, 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=400&fit=crop&q=80', 'Groceries', '500g',  true),
('Honey (500g)',                 399, 320, 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&fit=crop&q=80', 'Groceries', '500g',  true),
('Ketchup (500ml)',              110, 85,  'https://images.unsplash.com/photo-1606756790138-261d2b21cd75?w=400&fit=crop&q=80', 'Groceries', '500ml', true),

-- ========== ESSENTIALS ==========
('Sanitizer Spray (300ml)',     99,  75,  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&fit=crop&q=80', 'Essentials', '300ml',         true),
('Dish Wash Liquid (750ml)',    120, 90,  'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=400&fit=crop&q=80', 'Essentials', '750ml',         true),
('Tissues (6-pack)',            180, 140, 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400&fit=crop&q=80', 'Essentials', '6x100 sheets', true),
('Shampoo (200ml)',             220, 175, 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=400&fit=crop&q=80', 'Essentials', '200ml',         true),
('Face Wash (100ml)',           250, 199, 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&fit=crop&q=80', 'Essentials', '100ml',         true),
('Sunscreen SPF50 (50ml)',      450, 380, 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&fit=crop&q=80', 'Essentials', '50ml',          true),
('Vitamin C Supplement',        599, 499, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&fit=crop&q=80', 'Essentials', '60 tablets',    true);
