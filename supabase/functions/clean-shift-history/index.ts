
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.29.0';
import { format, subMonths } from 'https://esm.sh/date-fns@2.30.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS for preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Initialize Supabase client with environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Calculate the date one month ago
    const oneMonthAgo = subMonths(new Date(), 1);
    const formattedDate = format(oneMonthAgo, 'yyyy-MM-dd');
    
    console.log(`Deleting shift history data older than ${formattedDate}`);
    
    // Delete schedules with status 'completed' or 'rejected' older than one month
    const { data: deletedSchedules, error: schedulesError } = await supabase
      .from('schedules')
      .delete({ returning: 'minimal', count: 'exact' })
      .lt('start_time', formattedDate)
      .in('status', ['completed', 'rejected']);
    
    if (schedulesError) {
      throw schedulesError;
    }
    
    // Delete shift_swaps older than one month
    const { data: deletedShiftSwaps, error: shiftSwapsError } = await supabase
      .from('shift_swaps')
      .delete({ returning: 'minimal', count: 'exact' })
      .lt('created_at', formattedDate);
    
    if (shiftSwapsError) {
      throw shiftSwapsError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Successfully removed old shift history data',
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error cleaning shift history:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
