import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AccountingExportRequest {
  provider: 'quickbooks' | 'xero';
  action: 'test_connection' | 'export_payroll' | 'export_journal';
  period?: string; // e.g. '2025-08'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { provider, action, period }: AccountingExportRequest = await req.json();

    const missing: string[] = [];
    if (provider === 'quickbooks') {
      if (!Deno.env.get('QBO_ACCESS_TOKEN')) missing.push('QBO_ACCESS_TOKEN');
    }
    if (provider === 'xero') {
      if (!Deno.env.get('XERO_ACCESS_TOKEN')) missing.push('XERO_ACCESS_TOKEN');
    }

    if (missing.length > 0) {
      return new Response(
        JSON.stringify({ success: false, message: `Missing secrets: ${missing.join(', ')}` }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (action === 'test_connection') {
      return new Response(
        JSON.stringify({ success: true, provider, message: 'Connection OK (stub)' }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Stub export response
    return new Response(
      JSON.stringify({ success: true, provider, action, period: period ?? 'current', message: 'Export queued (stub)' }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error) {
    console.error('accounting-export error:', error);
    return new Response(JSON.stringify({ success: false, error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
