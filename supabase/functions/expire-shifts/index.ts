import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting shift expiration process...');

    // Call the database function to process expired shifts
    const { data, error } = await supabaseClient.rpc('process_shift_expiration');

    if (error) {
      console.error('Error processing shift expiration:', error);
      throw error;
    }

    console.log('Shift expiration process completed successfully');

    // Also check for any open shifts that need immediate expiration
    const { data: expiredCount, error: markError } = await supabaseClient.rpc('mark_expired_open_shifts');

    if (markError) {
      console.error('Error marking expired shifts:', markError);
      throw markError;
    }

    console.log(`Marked ${expiredCount || 0} shifts as expired`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        expiredShifts: expiredCount || 0,
        message: 'Shift expiration process completed successfully' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in expire-shifts function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});