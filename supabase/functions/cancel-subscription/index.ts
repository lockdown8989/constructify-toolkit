
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (step: string, details?: unknown) => {
  console.log(`[CANCEL-SUBSCRIPTION] ${step}`, details ?? "");
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    log("Function started");
    
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

    log("User authenticated", { userId: user.id, email: user.email });

    // Only admins can cancel subscriptions
    const { data: roles } = await supabaseAnon
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
    const isAdmin = roles?.some((r: any) => r.role === "admin");
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Only administrators can cancel subscriptions" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    log("Admin verification passed");

    // Determine payer email (owner of org). If no org, use self.
    let payerEmail = user.email as string;
    let organizationId = null;

    try {
      const { data: ownOrg, error: ownOrgError } = await supabaseSvc
        .from("organizations")
        .select("id, owner_user_id")
        .eq("owner_user_id", user.id)
        .maybeSingle();

      if (ownOrgError) {
        log("Warning: Could not fetch own organization", { error: ownOrgError.message });
      }

      organizationId = ownOrg?.id ?? null;

      if (!ownOrg) {
        const { data: memberOrg, error: memberOrgError } = await supabaseSvc
          .from("organization_members")
          .select("organization_id, organizations ( id, owner_user_id )")
          .eq("user_id", user.id)
          .limit(1)
          .maybeSingle();
          
        if (memberOrgError) {
          log("Warning: Could not fetch member organization", { error: memberOrgError.message });
        }
        
        const orgRow: any = memberOrg?.organizations;
        if (orgRow) {
          organizationId = orgRow.id;
          const { data: ownerProfile, error: ownerProfileError } = await supabaseSvc
            .from("profiles")
            .select("email")
            .eq("id", orgRow.owner_user_id)
            .maybeSingle();
            
          if (ownerProfileError) {
            log("Warning: Could not fetch owner profile", { error: ownerProfileError.message });
          }
          
          if (ownerProfile?.email) payerEmail = ownerProfile.email;
        }
      }
    } catch (orgError: any) {
      log("Warning: Organization lookup failed, proceeding with user email", { error: orgError.message });
    }

    log("Using payer email", { payerEmail, organizationId });
    
    const customers = await stripe.customers.list({ email: payerEmail, limit: 1 });
    log("Stripe customers retrieved", { count: customers.data.length });

    if (customers.data.length === 0) {
      log("No Stripe customer found");
      return new Response(JSON.stringify({ error: "No Stripe customer found for this organization" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    const customerId = customers.data[0].id;
    log("Found Stripe customer", { customerId });
    
    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({ 
      customer: customerId, 
      status: "active",
      limit: 1 
    });
    log("Retrieved subscriptions", { count: subscriptions.data.length });

    if (subscriptions.data.length === 0) {
      log("No active subscription found");
      return new Response(JSON.stringify({ error: "No active subscription found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    const subscription = subscriptions.data[0];
    log("Found active subscription", { subscriptionId: subscription.id, status: subscription.status });
    
    // Check if already cancelled
    if (subscription.cancel_at_period_end) {
      log("Subscription already scheduled for cancellation");
      return new Response(JSON.stringify({ 
        success: true,
        message: "Subscription is already scheduled for cancellation",
        subscription: {
          id: subscription.id,
          status: "cancel_at_period_end",
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    // Cancel the subscription at period end
    log("Attempting to cancel subscription at period end");
    const canceledSubscription = await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true,
    });

    log("Subscription scheduled for cancellation", { 
      subscriptionId: subscription.id,
      cancelAtPeriodEnd: canceledSubscription.cancel_at_period_end,
      currentPeriodEnd: new Date(canceledSubscription.current_period_end * 1000)
    });

    // Record the cancellation event in our database (optional, continue if fails)
    try {
      await supabaseSvc.from("subscription_events").insert({
        user_id: user.id,
        organization_id: organizationId,
        event_type: "cancelled",
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        previous_status: "active",
        new_status: "cancel_at_period_end",
        event_data: {
          cancel_at_period_end: true,
          current_period_end: new Date(canceledSubscription.current_period_end * 1000).toISOString(),
          cancellation_reason: "user_requested",
          cancelled_by: user.id,
          cancelled_at: new Date().toISOString()
        }
      });
      log("Recorded cancellation event in database");
    } catch (eventError: any) {
      log("Warning: Failed to record cancellation event", { error: eventError.message });
    }

    // Update the subscribers table
    try {
      await supabaseSvc.from("subscribers").upsert({
        email: payerEmail,
        organization_id: organizationId,
        user_id: user.id,
        stripe_customer_id: customerId,
        subscribed: true, // Still active until period end
        subscription_status: "cancel_at_period_end",
        updated_at: new Date().toISOString(),
      }, { onConflict: "email" });
      log("Updated subscribers table");
    } catch (updateError: any) {
      log("Warning: Failed to update subscribers table", { error: updateError.message });
    }

    log("Function completed successfully");
    return new Response(
      JSON.stringify({
        success: true,
        message: "Subscription scheduled for cancellation at the end of the current billing period",
        subscription: {
          id: subscription.id,
          status: "cancel_at_period_end",
          current_period_end: new Date(canceledSubscription.current_period_end * 1000).toISOString(),
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    log("Error occurred", { error: error.message, stack: error.stack });
    return new Response(JSON.stringify({ error: error.message || String(error) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
