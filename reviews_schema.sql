-- REVIEWS TABLE SCHEMA
-- Run this in Supabase SQL Editor

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

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Users can insert their own reviews
CREATE POLICY "users_insert_own_reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can read all reviews (for product display)
CREATE POLICY "anyone_can_read_reviews" ON public.reviews FOR SELECT USING (true);

-- Add rider_id column to orders if not exists (for rider assignment)
DO $$ BEGIN
    ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS rider_id UUID REFERENCES auth.users(id);
EXCEPTION WHEN others THEN NULL;
END $$;
