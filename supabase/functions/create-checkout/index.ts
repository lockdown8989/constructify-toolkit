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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
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

    // Create Checkout session for subscription
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Reuse existing customer if present
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) customerId = customers.data[0].id;

    const origin = req.headers.get("origin") || "http://localhost:3000";

    // Defaults: Monthly 7.99 GBP; can be changed later to Price IDs
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: { name: "Pro Plan Subscription" },
            unit_amount: 799,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/billing?status=success`,
      cancel_url: `${origin}/billing?status=canceled`,
      metadata: {
        organization_id: organizationId!,
        owner_user_id: user.id,
      },
    });

    log("Checkout session created", { sessionId: session.id, organizationId });

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
