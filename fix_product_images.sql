-- Fix product image URLs in Supabase
-- Run this in your Supabase SQL Editor to update all product images to working URLs

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&fit=crop&q=80' WHERE name ILIKE '%mango%';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&fit=crop&q=80' WHERE name ILIKE '%yogurt%' OR name ILIKE '%curd%';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&fit=crop&q=80' WHERE name ILIKE '%oreo%' OR name ILIKE '%biscuit%' OR name ILIKE '%cookie%';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&fit=crop&q=80' WHERE name ILIKE '%cola%' OR name ILIKE '%coke%';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&fit=crop&q=80' WHERE name ILIKE '%spinach%' OR name ILIKE '%greens%';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1601039676563-f193ff3fbbb2?w=400&fit=crop&q=80' WHERE name ILIKE '%avocado%';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&fit=crop&q=80' WHERE name ILIKE '%bread%' OR name ILIKE '%sourdough%';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&fit=crop&q=80' WHERE name ILIKE '%milk%';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&fit=crop&q=80' WHERE name ILIKE '%potato%' OR name ILIKE '%chips%';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1582797493098-23d8d0cc6769?w=400&fit=crop&q=80' WHERE name ILIKE '%egg%';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&fit=crop&q=80' WHERE name ILIKE '%onion%';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1519781542704-957ff19eff00?w=400&fit=crop&q=80' WHERE name ILIKE '%apple%';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=400&fit=crop&q=80' WHERE name ILIKE '%banana%';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&fit=crop&q=80' WHERE name ILIKE '%tomato%';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&fit=crop&q=80' WHERE name ILIKE '%water%' OR name ILIKE '%sparkling%';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&fit=crop&q=80' WHERE name ILIKE '%earbuds%' OR name ILIKE '%headphone%' OR name ILIKE '%wireless%';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1511381939415-e44aa117067b?w=400&fit=crop&q=80' WHERE name ILIKE '%chocolate%';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&fit=crop&q=80' WHERE name ILIKE '%ramen%' OR name ILIKE '%noodle%';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1621936810259-bca9c91ade08?w=400&fit=crop&q=80' WHERE name ILIKE '%pocky%';

-- Set a good default fallback for any product that still has a null/empty image_url
UPDATE products
SET image_url = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&fit=crop&q=80'
WHERE image_url IS NULL OR image_url = '';
