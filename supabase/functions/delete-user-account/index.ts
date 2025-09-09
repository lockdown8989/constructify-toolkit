import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from auth header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Rate limiting: Check recent deletion attempts
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    const { data: recentAttempts } = await supabase
      .from('auth_events')
      .select('id')
      .eq('email', user.email)
      .eq('event_type', 'account_deletion_attempt')
      .gte('created_at', fiveMinutesAgo);

    if (recentAttempts && recentAttempts.length >= 3) {
      console.log(`Account deletion rate limit exceeded for user: ${user.id}`);
      return new Response(
        JSON.stringify({ error: 'Too many deletion attempts. Please try again later.' }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Log the deletion attempt
    await supabase
      .from('auth_events')
      .insert({
        event_type: 'account_deletion_attempt',
        email: user.email || '',
        additional_data: { 
          user_id: user.id,
          ip: req.headers.get('cf-connecting-ip') || 'unknown' 
        }
      });

    // Call the secure deletion function
    const { data: deleteResult, error: deleteError } = await supabase
      .rpc('safe_delete_user_data', { target_user_id: user.id });

    if (deleteError) {
      console.error('User data deletion failed:', deleteError);
      return new Response(
        JSON.stringify({ error: 'Failed to delete user data' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Delete the auth user
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(user.id);

    if (authDeleteError) {
      console.error('Auth user deletion failed:', authDeleteError);
      return new Response(
        JSON.stringify({ error: 'Failed to delete user account' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`User account deleted successfully: ${user.id}`);
    return new Response(
      JSON.stringify({ 
        message: 'Account deleted successfully',
        deletionDetails: deleteResult 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Unexpected error during account deletion:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});