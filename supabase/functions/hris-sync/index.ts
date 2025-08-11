import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface HRISSyncRequest {
  provider: 'bamboohr' | 'workday';
  action: 'test_connection' | 'pull_employees' | 'push_employees';
  payload?: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { provider, action }: HRISSyncRequest = await req.json();

    // Check required secrets for each provider
    const missing: string[] = [];
    if (provider === 'bamboohr') {
      if (!Deno.env.get('BAMBOOHR_API_KEY')) missing.push('BAMBOOHR_API_KEY');
      if (!Deno.env.get('BAMBOOHR_SUBDOMAIN')) missing.push('BAMBOOHR_SUBDOMAIN');
    }
    if (provider === 'workday') {
      if (!Deno.env.get('WORKDAY_TENANT')) missing.push('WORKDAY_TENANT');
      if (!Deno.env.get('WORKDAY_CLIENT_ID')) missing.push('WORKDAY_CLIENT_ID');
      if (!Deno.env.get('WORKDAY_CLIENT_SECRET')) missing.push('WORKDAY_CLIENT_SECRET');
    }

    if (missing.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: `Missing secrets: ${missing.join(', ')}`,
          hint: 'Add secrets in Supabase -> Settings -> Functions',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // For now, return a stubbed response indicating the action would run
    return new Response(
      JSON.stringify({ success: true, provider, action, message: 'Connection OK (stub)' }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error) {
    console.error('hris-sync error:', error);
    return new Response(JSON.stringify({ success: false, error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
