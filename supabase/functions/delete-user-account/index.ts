
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
    
    // Get employee record first (if exists) to handle cascade deletions properly
    const { data: employeeRecord } = await supabaseAdmin
      .from('employees')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (employeeRecord) {
      console.log("Found employee record:", employeeRecord.id);
      
      // Delete employee-related data first (in correct order to avoid FK violations)
      const employeeRelatedTables = [
        'shift_notifications',
        'shift_applications', 
        'clock_notifications',
        'employee_location_logs',
        'shift_pattern_assignments',
        'attendance',
        'availability_patterns',
        'availability_requests', 
        'calendar_preferences',
        'document_assignments',
        'documents',
        'leave_calendar',
        'open_shift_assignments',
        'payroll',
        'salary_statistics',
        'schedules'
      ];
      
      for (const table of employeeRelatedTables) {
        try {
          const { error } = await supabaseAdmin
            .from(table)
            .delete()
            .eq('employee_id', employeeRecord.id);
            
          if (error && !error.message.includes('does not exist') && !error.message.includes('column "employee_id" does not exist')) {
            console.warn(`Warning when deleting from ${table}:`, error);
          } else if (!error) {
            console.log(`Successfully deleted ${table} records for employee ${employeeRecord.id}`);
          }
        } catch (err) {
          console.warn(`Error deleting from ${table}:`, err);
          // Continue with other tables even if one fails
        }
      }
      
      // Now delete the employee record itself (user_id will be set to NULL due to constraint)
      try {
        const { error } = await supabaseAdmin
          .from('employees')
          .delete()
          .eq('id', employeeRecord.id);
        if (error) {
          console.warn("Error deleting employee record:", error);
        } else {
          console.log("Successfully deleted employee record");
        }
      } catch (err) {
        console.warn("Error deleting employee record:", err);
      }
    }
    
    // Delete direct user-related data (these should CASCADE automatically now)
    const userTables = [
      'workflow_requests',
      'notification_settings', 
      'notifications',
      'user_roles',
      'profiles'
    ];
    
    for (const table of userTables) {
      try {
        const { error } = await supabaseAdmin
          .from(table)
          .delete()
          .eq('user_id', user.id);
          
        if (error && !error.message.includes('does not exist')) {
          console.warn(`Warning when deleting from ${table}:`, error);
        } else if (!error) {
          console.log(`Successfully deleted ${table} records for user ${user.id}`);
        }
      } catch (err) {
        console.warn(`Error deleting from ${table}:`, err);
        // Continue with other tables even if one fails
      }
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
