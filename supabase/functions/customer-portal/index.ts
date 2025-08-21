import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (step: string, details?: unknown) => {
  console.log(`[CUSTOMER-PORTAL] ${step}`, details ?? "");
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseAnon = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
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
    if (!user?.email) throw new Error("User not authenticated");

    // Only admins can open the portal
    const { data: roles } = await supabaseAnon
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
    const isAdmin = roles?.some((r: any) => r.role === "admin");
    const isManager = roles?.some((r: any) => r.role === "employer");
    if (!(isAdmin || isManager)) {
      return new Response(JSON.stringify({ error: "Only administrators or managers can manage the subscription" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    // Determine payer email (owner of org). If no org, use self.
    const { data: ownOrg } = await supabaseSvc
      .from("organizations")
      .select("id, owner_user_id")
      .eq("owner_user_id", user.id)
      .maybeSingle();

    let payerEmail = user.email as string;
    if (!ownOrg) {
      const { data: memberOrg } = await supabaseSvc
        .from("organization_members")
        .select("organization_id, organizations ( id, owner_user_id )")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();
      const orgRow: any = memberOrg?.organizations;
      if (orgRow) {
        const { data: ownerProfile } = await supabaseSvc
          .from("profiles")
          .select("email")
          .eq("id", orgRow.owner_user_id)
          .maybeSingle();
        if (ownerProfile?.email) payerEmail = ownerProfile.email;
      }
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: payerEmail, limit: 1 });
    if (customers.data.length === 0) {
      return new Response(JSON.stringify({ error: "No Stripe customer found for this organization" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";
    const portal = await stripe.billingPortal.sessions.create({
      customer: customers.data[0].id,
      return_url: `${origin}/billing`,
    });

    log("Portal created", { sessionId: portal.id });

    return new Response(JSON.stringify({ url: portal.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("[CUSTOMER-PORTAL] Error:", error);
    return new Response(JSON.stringify({ error: error.message || String(error) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
