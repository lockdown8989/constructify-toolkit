
-- Create subscription_events table to track subscription changes
CREATE TABLE public.subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID,
  event_type TEXT NOT NULL, -- 'created', 'cancelled', 'updated', 'reactivated'
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  previous_status TEXT,
  new_status TEXT,
  event_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own subscription events
CREATE POLICY "Users can view their own subscription events" ON public.subscription_events
  FOR SELECT
  USING (user_id = auth.uid());

-- Create policy for admins to view all subscription events
CREATE POLICY "Admins can view all subscription events" ON public.subscription_events
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'employer', 'hr')
  ));

-- Create policy for edge functions to insert subscription events
CREATE POLICY "Edge functions can insert subscription events" ON public.subscription_events
  FOR INSERT
  WITH CHECK (true);

-- Create policy for edge functions to update subscription events
CREATE POLICY "Edge functions can update subscription events" ON public.subscription_events
  FOR UPDATE
  USING (true);

-- Add index for better performance
CREATE INDEX idx_subscription_events_user_id ON public.subscription_events(user_id);
CREATE INDEX idx_subscription_events_event_type ON public.subscription_events(event_type);
CREATE INDEX idx_subscription_events_created_at ON public.subscription_events(created_at);
