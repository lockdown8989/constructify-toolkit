
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.14.0';
import { corsHeaders } from '../_shared/cors.ts';

console.log("Schedule notification function started");

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data, error: scheduleError } = await supabaseClient
      .from('schedules')
      .select('id, employee_id, title, start_time, end_time')
      .order('created_at', { ascending: false })
      .limit(5);

    if (scheduleError) {
      throw scheduleError;
    }

    // For each recent schedule, ensure notification exists
    for (const schedule of data) {
      const { data: employeeData, error: employeeError } = await supabaseClient
        .from('employees')
        .select('user_id')
        .eq('id', schedule.employee_id)
        .single();

      if (employeeError) {
        console.error('Error fetching employee:', employeeError);
        continue;
      }

      if (!employeeData.user_id) {
        console.error('Employee has no user_id, cannot send notification');
        continue;
      }

      // Check if notification already exists
      const { data: existingNotifications, error: notificationError } = await supabaseClient
        .from('notifications')
        .select('id')
        .eq('user_id', employeeData.user_id)
        .eq('related_entity', 'schedule')
        .eq('related_id', schedule.id);

      if (notificationError) {
        console.error('Error checking notifications:', notificationError);
        continue;
      }

      // If no notification exists, create one
      if (!existingNotifications.length) {
        const start = new Date(schedule.start_time);
        const end = new Date(schedule.end_time);
        
        const { error: insertError } = await supabaseClient
          .from('notifications')
          .insert({
            user_id: employeeData.user_id,
            title: 'New Shift Assigned',
            message: `You have been assigned a ${schedule.title} shift on ${start.toLocaleDateString()} from ${start.toLocaleTimeString()} to ${end.toLocaleTimeString()}`,
            type: 'info',
            related_entity: 'schedule',
            related_id: schedule.id,
          });

        if (insertError) {
          console.error('Error creating notification:', insertError);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in schedule notification function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500,
      }
    );
  }
});
