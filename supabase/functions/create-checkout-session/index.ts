import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://fphmujxruswmvlwceodl.supabase.co",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Allowed price IDs for security
const ALLOWED_PRICE_IDS = [
  'price_1234567890', // Add your actual Stripe price IDs here
  'price_0987654321',
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get the session or user object with proper error handling
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !data.user?.email) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Authentication failed" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const user = data.user;

    // Validate request body
    const body = await req.json();
    const { priceId } = body;

    if (!priceId || typeof priceId !== "string") {
      return new Response(
        JSON.stringify({ error: "Valid price ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate price ID format and whitelist
    if (!priceId.startsWith("price_") || !ALLOWED_PRICE_IDS.includes(priceId)) {
      return new Response(
        JSON.stringify({ error: "Invalid or unauthorized price ID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Authorization check - ensure user can create checkout sessions
    const { data: userRoles } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isAuthorized = userRoles?.some(r => ['admin', 'employer', 'hr'].includes(r.role));
    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ error: "Insufficient permissions to create checkout session" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Stripe checkout session with additional security
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: "https://fphmujxruswmvlwceodl.supabase.co/billing?success=true&session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://fphmujxruswmvlwceodl.supabase.co/billing?canceled=true",
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        user_email: user.email,
        created_via: "secure_checkout_function"
      },
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes expiry
    });

    // Log the checkout session creation for security monitoring
    try {
      await supabaseAdmin.from('data_processing_log').insert({
        user_id: user.id,
        action_type: 'create',
        table_name: 'stripe_checkout_session',
        legal_basis: 'contract',
        processed_data: {
          session_id: session.id,
          price_id: priceId,
          amount: session.amount_total,
          timestamp: new Date().toISOString()
        }
      });
    } catch (logError) {
      console.error("Error logging checkout session:", logError);
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in create-checkout-session:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create checkout session" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});