import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CalendarSyncRequest {
  employeeId: string;
  scheduleData: {
    title: string;
    startTime: string;
    endTime: string;
    location?: string;
    description?: string;
  };
  provider: 'google' | 'outlook';
}

const createGoogleCalendarEvent = async (accessToken: string, eventData: any) => {
  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      summary: eventData.title,
      description: eventData.description,
      start: {
        dateTime: eventData.startTime,
        timeZone: 'Europe/London',
      },
      end: {
        dateTime: eventData.endTime,
        timeZone: 'Europe/London',
      },
      location: eventData.location,
    }),
  });

  if (!response.ok) {
    throw new Error(`Google Calendar API error: ${response.statusText}`);
  }

  return await response.json();
};

const createOutlookCalendarEvent = async (accessToken: string, eventData: any) => {
  const response = await fetch('https://graph.microsoft.com/v1.0/me/events', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subject: eventData.title,
      body: {
        contentType: 'HTML',
        content: eventData.description || '',
      },
      start: {
        dateTime: eventData.startTime,
        timeZone: 'Europe/London',
      },
      end: {
        dateTime: eventData.endTime,
        timeZone: 'Europe/London',
      },
      location: {
        displayName: eventData.location || '',
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Outlook Calendar API error: ${response.statusText}`);
  }

  return await response.json();
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { employeeId, scheduleData, provider }: CalendarSyncRequest = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get employee's calendar integration settings
    const { data: employee, error } = await supabase
      .from('employees')
      .select(`
        *,
        calendar_integrations (
          provider,
          access_token,
          refresh_token
        )
      `)
      .eq('id', employeeId)
      .single();

    if (error || !employee) {
      throw new Error("Employee not found");
    }

    const integration = employee.calendar_integrations?.find((int: any) => int.provider === provider);
    
    if (!integration) {
      throw new Error(`${provider} calendar not connected for this employee`);
    }

    let result;
    if (provider === 'google') {
      result = await createGoogleCalendarEvent(integration.access_token, scheduleData);
    } else if (provider === 'outlook') {
      result = await createOutlookCalendarEvent(integration.access_token, scheduleData);
    }

    // Log the sync activity
    await supabase.from('notifications').insert({
      user_id: employee.user_id,
      title: 'Calendar Synced',
      message: `Schedule "${scheduleData.title}" has been added to your ${provider} calendar`,
      type: 'info',
      related_entity: 'calendar',
      related_id: result.id
    });

    console.log(`Calendar event created successfully for ${provider}:`, result.id);

    return new Response(JSON.stringify({ 
      success: true, 
      eventId: result.id,
      provider: provider
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error syncing calendar:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);