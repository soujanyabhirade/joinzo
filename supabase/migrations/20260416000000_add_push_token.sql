-- Add push_token column to user_profiles table for Expo Push Notifications
-- Run this in Supabase Dashboard → SQL Editor

ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS push_token TEXT;

-- Optional: index for faster lookups when broadcasting to multiple riders
CREATE INDEX IF NOT EXISTS idx_user_profiles_push_token ON public.user_profiles(push_token) WHERE push_token IS NOT NULL;
