import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    console.log('🚀 Starting attendance monitoring...');

    // Create shift notifications for all employees
    console.log('📅 Creating shift notifications...');
    const { error: createError } = await supabase.rpc('create_shift_notifications');
    if (createError) {
      console.error('❌ Error creating shift notifications:', createError);
    } else {
      console.log('✅ Shift notifications created successfully');
    }

    // Send due shift notifications
    console.log('🔔 Sending due shift notifications...');
    const { error: sendError } = await supabase.rpc('send_due_shift_notifications');
    if (sendError) {
      console.error('❌ Error sending due shift notifications:', sendError);
    } else {
      console.log('✅ Due shift notifications sent successfully');
    }

    // Check for attendance violations (late arrivals, missing clock-outs)
    console.log('⚠️ Checking attendance violations...');
    const { error: violationError } = await supabase.rpc('check_attendance_violations');
    if (violationError) {
      console.error('❌ Error checking attendance violations:', violationError);
    } else {
      console.log('✅ Attendance violations checked successfully');
    }

    // Monitor current sessions for overtime
    console.log('⏰ Monitoring active sessions for overtime...');
    const { data: activeSessions, error: sessionError } = await supabase
      .from('attendance')
      .select('id, employee_id, check_in, scheduled_end_time, employees!inner(name)')
      .eq('active_session', true)
      .is('check_out', null);

    if (sessionError) {
      console.error('❌ Error fetching active sessions:', sessionError);
    } else if (activeSessions && activeSessions.length > 0) {
      console.log(`📊 Found ${activeSessions.length} active sessions to monitor`);
      
      for (const session of activeSessions) {
        console.log(`👤 Monitoring session for employee: ${session.employees?.name || 'Unknown'}`);
        
        // Calculate real-time overtime if employee is working past schedule
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const dayOfWeek = now.getDay();
        
        // Get employee's scheduled end time for today
        const { data: employee, error: empError } = await supabase
          .from('employees')
          .select(`
            sunday_end_time,
            monday_end_time,
            tuesday_end_time,
            wednesday_end_time,
            thursday_end_time,
            friday_end_time,
            saturday_end_time
          `)
          .eq('id', session.employee_id)
          .single();

        if (!empError && employee) {
          const dayColumns = [
            'sunday_end_time', 'monday_end_time', 'tuesday_end_time',
            'wednesday_end_time', 'thursday_end_time', 'friday_end_time', 'saturday_end_time'
          ];
          
          const scheduledEndTime = employee[dayColumns[dayOfWeek] as keyof typeof employee] as string;
          
          if (scheduledEndTime) {
            const scheduledEnd = new Date();
            const [hours, minutes] = scheduledEndTime.split(':');
            scheduledEnd.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            
            if (now > scheduledEnd) {
              const overtimeMinutes = Math.floor((now.getTime() - scheduledEnd.getTime()) / (1000 * 60));
              
              // Update attendance record with real-time overtime
              const { error: updateError } = await supabase
                .from('attendance')
                .update({ 
                  overtime_minutes: overtimeMinutes,
                  overtime_status: 'pending'
                })
                .eq('id', session.id);
              
              if (!updateError) {
                console.log(`⏰ Updated overtime for ${session.employees?.name}: ${overtimeMinutes} minutes`);
              }
            }
          }
        }
      }
    } else {
      console.log('📊 No active sessions found');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Attendance monitoring completed successfully',
        activeSessions: activeSessions?.length || 0
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('💥 Error in attendance monitoring:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});