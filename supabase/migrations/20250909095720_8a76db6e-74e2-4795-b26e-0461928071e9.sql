-- Remove all Stripe-related database tables and functions
DROP TABLE IF EXISTS public.subscribers CASCADE;
DROP TABLE IF EXISTS public.subscription_events CASCADE;

-- Remove any Stripe-related functions (if they exist)
DROP FUNCTION IF EXISTS public.handle_stripe_webhook CASCADE;
DROP FUNCTION IF EXISTS public.check_subscription_status CASCADE;
DROP FUNCTION IF EXISTS public.update_subscription_status CASCADE;