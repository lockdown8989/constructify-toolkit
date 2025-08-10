import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  imageBase64?: string;
  action?: 'in' | 'out';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { imageBase64, action }: RequestBody = await req.json();

    if (!imageBase64 || !action) {
      return new Response(JSON.stringify({ error: 'Missing image or action' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const FACE_API_KEY = Deno.env.get('FACE_API_KEY');

    // If no API key yet, inform the client that setup is required
    if (!FACE_API_KEY) {
      return new Response(JSON.stringify({ requiresSetup: true, message: 'FACE_API_KEY not configured' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Placeholder: integrate with your preferred face recognition provider here.
    // The logic should:
    // 1) Receive the imageBase64
    // 2) Compare with enrolled employee reference photos (stored in Supabase Storage or DB)
    // 3) Return { matchedEmployeeId, confidence }

    // For now, return no match until provider + enrollment are configured
    const response = { matchedEmployeeId: null, confidence: 0 };

    return new Response(JSON.stringify(response), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('face-verify error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
