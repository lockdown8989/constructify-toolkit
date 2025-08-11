-- Add subscription_status column to subscribers table to track cancellation status
ALTER TABLE public.subscribers 
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'active';