-- RIDERS TABLE SCHEMA
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.riders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    vehicle_type TEXT NOT NULL, -- 'Bicycle', 'Scooter', 'Motorbike', 'Electric Bike'
    vehicle_number TEXT NOT NULL,
    dl_number TEXT NOT NULL UNIQUE,
    aadhar_number TEXT NOT NULL UNIQUE,
    availability TEXT NOT NULL DEFAULT 'offline', -- 'online', 'offline', 'on_delivery'
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.riders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Riders can view their own data" ON public.riders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Riders can insert their own application" ON public.riders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Riders can update their own application" ON public.riders
    FOR UPDATE USING (auth.uid() = user_id);
