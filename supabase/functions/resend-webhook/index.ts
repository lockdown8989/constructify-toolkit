
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResendWebhookEvent {
  type: string;
  created_at: string;
  data: {
    created_at: string;
    email_id: string;
    from: string;
    subject: string;
    to: string[];
    tags?: string[];
    bounce?: {
      type: string;
      bounced_at: string;
    };
    complaint?: {
      complained_at: string;
      feedback_type: string;
    };
    delivery?: {
      delivered_at: string;
    };
    click?: {
      clicked_at: string;
      link: string;
    };
    open?: {
      opened_at: string;
    };
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    const event: ResendWebhookEvent = await req.json();
    
    console.log("Received Resend webhook event:", {
      type: event.type,
      email_id: event.data?.email_id,
      subject: event.data?.subject,
      to: event.data?.to
    });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Log the email event to database (optional - create a table for email logs)
    const emailLogData = {
      email_id: event.data?.email_id,
      event_type: event.type,
      recipient_email: event.data?.to?.[0],
      subject: event.data?.subject,
      event_data: event.data,
      created_at: new Date().toISOString()
    };

    // Try to insert into email_logs table (create if needed)
    const { error: logError } = await supabase
      .from('email_logs')
      .insert(emailLogData);

    if (logError && logError.code !== '42P01') { // Ignore table not found error
      console.error("Error logging email event:", logError);
    }

    // Handle specific event types
    switch (event.type) {
      case 'email.sent':
        console.log(`✅ Email sent successfully to ${event.data.to[0]}`);
        break;
        
      case 'email.delivered':
        console.log(`📧 Email delivered to ${event.data.to[0]} at ${event.data.delivery?.delivered_at}`);
        break;
        
      case 'email.opened':
        console.log(`👁️ Email opened by ${event.data.to[0]} at ${event.data.open?.opened_at}`);
        break;
        
      case 'email.clicked':
        console.log(`🖱️ Email link clicked by ${event.data.to[0]} - Link: ${event.data.click?.link}`);
        break;
        
      case 'email.bounced':
        console.log(`❌ Email bounced for ${event.data.to[0]} - Type: ${event.data.bounce?.type}`);
        break;
        
      case 'email.complained':
        console.log(`⚠️ Email complained by ${event.data.to[0]} - Type: ${event.data.complaint?.feedback_type}`);
        break;
        
      case 'email.delivery_delayed':
        console.log(`⏰ Email delivery delayed for ${event.data.to[0]}`);
        break;
        
      default:
        console.log(`📨 Unhandled email event: ${event.type}`);
    }

    // Update notification status if this was a password reset email
    if (event.data?.subject?.includes('Reset Your TeamPulse Password')) {
      const recipientEmail = event.data.to[0];
      
      // You could update user notification preferences or log password reset attempts
      console.log(`Password reset email ${event.type} for ${recipientEmail}`);
      
      if (event.type === 'email.delivered') {
        console.log(`✅ Password reset email successfully delivered to ${recipientEmail}`);
      } else if (event.type === 'email.bounced') {
        console.log(`❌ Password reset email bounced for ${recipientEmail}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Webhook event ${event.type} processed successfully` 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error processing Resend webhook:", error);
    return new Response(
      JSON.stringify({ 
        error: "Webhook processing failed",
        details: error.message
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
