-- ============================================================
-- 🚀 JOINZO MASTER DATABASE SETUP
-- ============================================================
-- Run this ENTIRE file in Supabase SQL Editor (one-click setup)
-- Safe to re-run — uses IF NOT EXISTS and DROP/CREATE for policies
-- ============================================================


-- ============================================================
-- 1. ORDERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
    delivery_address TEXT,
    status TEXT NOT NULL DEFAULT 'placed',
    rider_id UUID REFERENCES auth.users(id),
    payment_method TEXT DEFAULT 'cod',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ BEGIN ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS rider_id UUID REFERENCES auth.users(id); EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'placed'; EXCEPTION WHEN others THEN NULL; END $$;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_own_orders" ON public.orders;
CREATE POLICY "users_own_orders" ON public.orders FOR ALL USING (auth.uid() = user_id);


-- ============================================================
-- 2. ORDER ITEMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price_at_order DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_read_own_items" ON public.order_items;
CREATE POLICY "users_read_own_items" ON public.order_items FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
DROP POLICY IF EXISTS "users_insert_own_items" ON public.order_items;
CREATE POLICY "users_insert_own_items" ON public.order_items FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));


-- ============================================================
-- 3. PRODUCTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    price_solo DECIMAL(10, 2) NOT NULL DEFAULT 0,
    price_loop DECIMAL(10, 2) DEFAULT 0,
    image_url TEXT,
    category TEXT DEFAULT 'Groceries',
    weight TEXT DEFAULT 'Unit',
    is_in_stock BOOLEAN DEFAULT true,
    partner_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ BEGIN ALTER TABLE public.products ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES auth.users(id); EXCEPTION WHEN others THEN NULL; END $$;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anyone_can_read_products" ON public.products;
CREATE POLICY "anyone_can_read_products" ON public.products FOR SELECT USING (true);
DROP POLICY IF EXISTS "partners_manage_products" ON public.products;
CREATE POLICY "partners_manage_products" ON public.products FOR ALL USING (auth.uid() = partner_id);


-- ============================================================
-- 4. PARTNERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    shop_name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    category TEXT NOT NULL,
    gst_number TEXT NOT NULL UNIQUE,
    fssai_number TEXT,
    address TEXT NOT NULL,
    coordinates JSONB,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "partners_view_own" ON public.partners;
CREATE POLICY "partners_view_own" ON public.partners FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "partners_insert_own" ON public.partners;
CREATE POLICY "partners_insert_own" ON public.partners FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "partners_update_own" ON public.partners;
CREATE POLICY "partners_update_own" ON public.partners FOR UPDATE USING (auth.uid() = user_id);


-- ============================================================
-- 5. RIDERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.riders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    vehicle_type TEXT NOT NULL,
    vehicle_number TEXT NOT NULL,
    dl_number TEXT NOT NULL UNIQUE,
    aadhar_number TEXT NOT NULL UNIQUE,
    availability TEXT NOT NULL DEFAULT 'offline',
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.riders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "riders_view_own" ON public.riders;
CREATE POLICY "riders_view_own" ON public.riders FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "riders_insert_own" ON public.riders;
CREATE POLICY "riders_insert_own" ON public.riders FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "riders_update_own" ON public.riders;
CREATE POLICY "riders_update_own" ON public.riders FOR UPDATE USING (auth.uid() = user_id);


-- ============================================================
-- 6. USER PROFILES (coins + referral)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    referral_code TEXT UNIQUE NOT NULL,
    coins_balance INTEGER NOT NULL DEFAULT 0,
    total_coins_earned INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_own_profile" ON public.user_profiles;
CREATE POLICY "users_own_profile" ON public.user_profiles FOR ALL USING (auth.uid() = id);


-- ============================================================
-- 7. COINS LEDGER
-- ============================================================
CREATE TABLE IF NOT EXISTS public.coins_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    amount INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.coins_ledger ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_own_ledger" ON public.coins_ledger;
CREATE POLICY "users_own_ledger" ON public.coins_ledger FOR ALL USING (auth.uid() = user_id);


-- ============================================================
-- 8. REFERRALS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID NOT NULL REFERENCES auth.users(id),
    referred_id UUID NOT NULL REFERENCES auth.users(id),
    coins_awarded INTEGER NOT NULL DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_own_referrals" ON public.referrals;
CREATE POLICY "users_own_referrals" ON public.referrals FOR SELECT USING (auth.uid() = referrer_id);


-- ============================================================
-- 9. REVIEWS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_rating INTEGER NOT NULL CHECK (product_rating BETWEEN 1 AND 5),
    rider_rating INTEGER CHECK (rider_rating BETWEEN 1 AND 5),
    review_text TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_insert_reviews" ON public.reviews;
CREATE POLICY "users_insert_reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "anyone_read_reviews" ON public.reviews;
CREATE POLICY "anyone_read_reviews" ON public.reviews FOR SELECT USING (true);


-- ============================================================
-- 10. AUTO-CREATE USER PROFILE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS TRIGGER AS $$
DECLARE
  ref_code TEXT;
BEGIN
  ref_code := UPPER(SUBSTRING(MD5(NEW.id::text) FROM 1 FOR 8));
  INSERT INTO public.user_profiles (id, referral_code, coins_balance)
  VALUES (NEW.id, ref_code, 50)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.create_user_profile();


-- ============================================================
-- 11. ENABLE REALTIME
-- ============================================================
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.orders; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.products; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews; EXCEPTION WHEN others THEN NULL; END $$;


-- ✅ DONE! 9 tables, RLS policies, signup trigger, and Realtime enabled.
