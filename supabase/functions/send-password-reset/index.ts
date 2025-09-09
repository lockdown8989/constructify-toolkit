import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  email: string;
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

    // Rate limiting: Check auth events for this email in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { body }: { body: RequestBody } = await req.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      console.log('Invalid email provided');
      return new Response(
        JSON.stringify({ error: 'Valid email is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Server-side rate limiting
    const { data: recentEvents } = await supabase
      .from('auth_events')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .eq('event_type', 'password_reset_request')
      .gte('created_at', oneHourAgo);

    if (recentEvents && recentEvents.length >= 3) {
      console.log(`Rate limit exceeded for email: ${email}`);
      return new Response(
        JSON.stringify({ error: 'Too many password reset attempts. Please try again later.' }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Log the password reset attempt
    await supabase
      .from('auth_events')
      .insert({
        event_type: 'password_reset_request',
        email: email.toLowerCase().trim(),
        additional_data: { ip: req.headers.get('cf-connecting-ip') || 'unknown' }
      });

    // Send password reset email
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.toLowerCase().trim(),
      {
        redirectTo: `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?type=recovery&token=`,
      }
    );

    if (resetError) {
      console.error('Password reset error:', resetError);
      return new Response(
        JSON.stringify({ error: 'Failed to send password reset email' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Password reset email sent successfully to: ${email}`);
    return new Response(
      JSON.stringify({ message: 'Password reset email sent successfully' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});