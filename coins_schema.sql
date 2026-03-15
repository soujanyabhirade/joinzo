-- REFERRAL & COINS SCHEMA
-- Run this entire block in Supabase SQL Editor

-- 1. Add referral_code and coins_balance to user profiles
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    referral_code TEXT UNIQUE NOT NULL,
    coins_balance INTEGER NOT NULL DEFAULT 0,
    total_coins_earned INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Coins ledger tracks every earn/spend event
CREATE TABLE IF NOT EXISTS public.coins_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'earn_referral', 'earn_order', 'spend_checkout', 'bonus'
    amount INTEGER NOT NULL, -- positive = earn, negative = spend
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Track referral relationships
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID NOT NULL REFERENCES auth.users(id),
    referred_id UUID NOT NULL REFERENCES auth.users(id),
    coins_awarded INTEGER NOT NULL DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coins_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "users_own_profile" ON public.user_profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "users_own_ledger" ON public.coins_ledger FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_referrals" ON public.referrals FOR SELECT USING (auth.uid() = referrer_id);

-- Auto-create profile on signup (Supabase Function Trigger)
CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS TRIGGER AS $$
DECLARE
  ref_code TEXT;
BEGIN
  ref_code := UPPER(SUBSTRING(MD5(NEW.id::text) FROM 1 FOR 8));
  INSERT INTO public.user_profiles (id, referral_code, coins_balance)
  VALUES (NEW.id, ref_code, 50) -- 50 welcome coins on signup
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.create_user_profile();
