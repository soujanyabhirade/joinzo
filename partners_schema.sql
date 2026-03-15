-- PARTNERS TABLE SCHEMA
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    shop_name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    category TEXT NOT NULL,
    gst_number TEXT NOT NULL UNIQUE,
    fssai_number TEXT,
    address TEXT NOT NULL,
    coordinates JSONB, -- { "lat": 12.9, "lng": 77.6 }
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Partners can view their own data" ON public.partners
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Partners can insert their own application" ON public.partners
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Partners can update their own application" ON public.partners
    FOR UPDATE USING (auth.uid() = user_id);
