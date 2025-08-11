import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (step: string, details?: unknown) => {
  console.log(`[CREATE-CHECKOUT] ${step}`, details ?? "");
};

type Payload = {
  planTier?: 'basic' | 'pro' | 'custom';
  interval?: 'month' | 'year';
  currency?: string; // e.g., 'gbp'
  trialDays?: number; // default 14
  priceId?: string; // optional Stripe Price ID to override
  customAmountCents?: number; // for custom plans - total amount in cents
  features?: string[]; // selected features for custom plan
  successUrl?: string;
  cancelUrl?: string;
};


const prices = {
  basic: { month: 799, year: 7999 },
  pro: { month: 1499, year: 14999 },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr) throw new Error(`Auth error: ${userErr.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    // Guard: only admins can start checkout
    const { data: roles, error: rolesErr } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
    if (rolesErr) throw new Error(`Roles lookup failed: ${rolesErr.message}`);
    const isAdmin = roles?.some((r: any) => r.role === "admin");
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Only administrators can purchase subscriptions" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    // Find or create an organization for this admin
    const { data: org, error: orgErr } = await supabase
      .from("organizations")
      .select("id")
      .eq("owner_user_id", user.id)
      .maybeSingle();
    if (orgErr) throw new Error(`Organization fetch failed: ${orgErr.message}`);

    let organizationId = org?.id as string | undefined;
    if (!organizationId) {
      const defaultName = `Team of ${user.email}`;
      const { data: inserted, error: insErr } = await supabase
        .from("organizations")
        .insert({ name: defaultName, owner_user_id: user.id })
        .select("id")
        .single();
      if (insErr) throw new Error(`Organization create failed: ${insErr.message}`);
      organizationId = inserted.id;
    }

    // Parse payload
    const body = (await req.json().catch(() => ({}))) as Payload;
    const planTier = body.planTier ?? 'basic';
    const interval = body.interval ?? 'month';
    const currency = (body.currency ?? 'gbp').toLowerCase();
    const trialDays = typeof body.trialDays === 'number' ? body.trialDays : 14;

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Reuse existing customer if present
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) customerId = customers.data[0].id;

    const origin = req.headers.get("origin") || "http://localhost:3000";

// Determine price
const priceId = body.priceId;
let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
if (priceId) {
  lineItems = [{ price: priceId, quantity: 1 }];
} else if (planTier === 'custom' && typeof body.customAmountCents === 'number' && body.customAmountCents > 0) {
  lineItems = [{
    price_data: {
      currency,
      product_data: { name: `Custom Plan Subscription (${interval})`, metadata: { features: JSON.stringify(body.features || []) } },
      unit_amount: body.customAmountCents,
      recurring: { interval },
    },
    quantity: 1,
  }];
} else {
  const unit_amount = prices[planTier][interval];
  lineItems = [{
    price_data: {
      currency,
      product_data: { name: `${planTier === 'basic' ? 'Basic' : 'Pro'} Plan Subscription (${interval})` },
      unit_amount,
      recurring: { interval },
    },
    quantity: 1,
  }];
}


    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: lineItems,
      mode: "subscription",
success_url: body.successUrl || `${origin}/billing?status=success&plan=${planTier}&interval=${interval}`,
cancel_url: body.cancelUrl || `${origin}/billing?status=canceled&plan=${planTier}&interval=${interval}`,
      metadata: {
        organization_id: organizationId!,
        owner_user_id: user.id,
        plan: planTier,
        interval,
      },
    });

    log("Checkout session created", { sessionId: session.id, organizationId, planTier, interval });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("[CREATE-CHECKOUT] Error:", error);
    return new Response(JSON.stringify({ error: error.message || String(error) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
