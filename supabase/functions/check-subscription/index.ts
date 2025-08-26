import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (step: string, details?: unknown) => {
  console.log(`[CHECK-SUBSCRIPTION] ${step}`, details ?? "");
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    // Use anon to authenticate the caller
    const supabaseAnon = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    // Use service role to bypass RLS for updates/reads across tables
    const supabaseSvc = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header");
    const token = authHeader.replace("Bearer ", "");

    const { data: userData, error: userErr } = await supabaseAnon.auth.getUser(token);
    if (userErr) throw new Error(`Auth error: ${userErr.message}`);
    const user = userData.user;
    if (!user?.id) throw new Error("User not authenticated");

    // Find the organization: owner org first, else where user is a member
    const { data: ownOrg } = await supabaseSvc
      .from("organizations")
      .select("id, owner_user_id")
      .eq("owner_user_id", user.id)
      .maybeSingle();

    let organizationId: string | null = ownOrg?.id ?? null;
    let ownerUserId: string | null = ownOrg?.owner_user_id ?? null;

    if (!organizationId) {
      const { data: memberOrg } = await supabaseSvc
        .from("organization_members")
        .select("organization_id, organizations ( id, owner_user_id )")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();
      const orgRow: any = memberOrg?.organizations ?? null;
      if (orgRow) {
        organizationId = orgRow.id;
        ownerUserId = orgRow.owner_user_id;
      }
    }

    // Resolve payer email: if caller is owner, it's their email; else look up profile of owner
    let payerEmail = user.email ?? undefined;
    if (ownerUserId && ownerUserId !== user.id) {
      const { data: ownerProfile } = await supabaseSvc
        .from("profiles")
        .select("email")
        .eq("id", ownerUserId)
        .maybeSingle();
      if (ownerProfile?.email) payerEmail = ownerProfile.email;
    }
    if (!payerEmail) throw new Error("Unable to resolve payer email");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: payerEmail, limit: 1 });

    let subscribed = false;
    let subscriptionTier: string | null = null;
    let subscriptionEnd: string | null = null;
    let customerId: string | null = null;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      const subs = await stripe.subscriptions.list({ customer: customerId, status: "active", limit: 1 });
      subscribed = subs.data.length > 0;
      if (subscribed) {
        const sub = subs.data[0];
        subscriptionEnd = new Date(sub.current_period_end * 1000).toISOString();
        const price = sub.items.data[0].price;
        const amount = price.unit_amount || 0;
        if (amount <= 999) subscriptionTier = "Basic";
        else if (amount <= 1999) subscriptionTier = "Premium";
        else subscriptionTier = "Enterprise";
      }
    }

    // Upsert org subscription record
    const upsertPayload: Record<string, any> = {
      organization_id: organizationId,
      user_id: ownerUserId ?? user.id,
      email: payerEmail,
      stripe_customer_id: customerId,
      subscribed,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      subscription_is_trial: false, // Add missing trial field
      subscription_trial_end: null, // Add missing trial end field
      updated_at: new Date().toISOString(),
    };

    await supabaseSvc.from("subscribers").upsert(upsertPayload, { onConflict: "email" });

    log("Subscription check complete", { organizationId, subscribed, subscriptionTier });

    return new Response(
      JSON.stringify({
        organization_id: organizationId,
        subscribed,
        subscription_tier: subscriptionTier,
        subscription_end: subscriptionEnd,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    console.error("[CHECK-SUBSCRIPTION] Error:", error);
    return new Response(JSON.stringify({ error: error.message || String(error) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
