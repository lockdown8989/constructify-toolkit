
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    // Create a Supabase client with the service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    // Get user auth from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get current user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: userError?.message }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log("Deleting user:", user.id);
    
    // Delete all user data first before removing the user account
    // Start with tables that may have foreign key constraints
    const tables = [
      'notifications',
      'user_roles',
      'profiles',
      'attendance',
      'availability_requests',
      'calendar_preferences',
      'documents',
      'employees',
      'leave_calendar',
      'notification_settings',
      'open_shift_assignments',
      'payroll',
      'salary_statistics',
      'schedules',
      'shift_swaps',
      'workflow_notifications',
      'workflow_requests'
    ];
    
    // Delete data from all tables where user_id matches
    for (const table of tables) {
      try {
        const { error } = await supabaseAdmin
          .from(table)
          .delete()
          .eq('user_id', user.id);
          
        if (error && !error.message.includes('does not exist')) {
          console.warn(`Warning when deleting from ${table}:`, error);
        }
      } catch (err) {
        console.warn(`Error deleting from ${table}:`, err);
        // Continue with other tables even if one fails
      }
    }
    
    // Special case for employees table which might use user_id as a foreign key
    try {
      await supabaseAdmin
        .from('employees')
        .delete()
        .eq('user_id', user.id);
    } catch (err) {
      console.warn("Error deleting employee record:", err);
    }
    
    // Delete the user from auth.users using admin API
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    
    if (deleteError) {
      console.error("Error deleting user:", deleteError);
      return new Response(
        JSON.stringify({ error: 'Failed to delete user', details: deleteError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ success: true, message: 'User and all associated data deleted successfully' }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in delete-user-account function:", error);
    return new Response(
      JSON.stringify({ error: 'Internal error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
