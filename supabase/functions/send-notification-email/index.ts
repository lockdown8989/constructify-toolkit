import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationEmailRequest {
  to: string;
  subject: string;
  type: 'payslip' | 'leave_approved' | 'leave_rejected' | 'schedule_updated' | 'overtime_approved';
  data: Record<string, any>;
}

const getEmailTemplate = (type: string, data: Record<string, any>) => {
  const baseStyles = `
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
      .content { background: #f9fafb; padding: 30px; }
      .button { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
      .amount { font-size: 24px; font-weight: bold; color: #059669; }
    </style>
  `;

  switch (type) {
    case 'payslip':
      return `
        ${baseStyles}
        <div class="container">
          <div class="header">
            <h1>💰 Your Payslip is Ready</h1>
          </div>
          <div class="content">
            <p>Hello ${data.employeeName},</p>
            <p>Your payslip for ${data.period} is now available.</p>
            <p class="amount">£${data.amount}</p>
            <p>Payment Date: ${data.paymentDate}</p>
            <a href="${data.loginUrl}" class="button">View Payslip</a>
          </div>
        </div>
      `;
    case 'leave_approved':
      return `
        ${baseStyles}
        <div class="container">
          <div class="header">
            <h1>✅ Leave Request Approved</h1>
          </div>
          <div class="content">
            <p>Hello ${data.employeeName},</p>
            <p>Your leave request from ${data.startDate} to ${data.endDate} has been approved.</p>
            <p><strong>Type:</strong> ${data.leaveType}</p>
            ${data.managerNotes ? `<p><strong>Notes:</strong> ${data.managerNotes}</p>` : ''}
            <a href="${data.loginUrl}" class="button">View Details</a>
          </div>
        </div>
      `;
    case 'schedule_updated':
      return `
        ${baseStyles}
        <div class="container">
          <div class="header">
            <h1>📅 Schedule Updated</h1>
          </div>
          <div class="content">
            <p>Hello ${data.employeeName},</p>
            <p>Your schedule has been updated:</p>
            <p><strong>Date:</strong> ${data.date}</p>
            <p><strong>Time:</strong> ${data.startTime} - ${data.endTime}</p>
            <p><strong>Location:</strong> ${data.location}</p>
            <a href="${data.loginUrl}" class="button">View Schedule</a>
          </div>
        </div>
      `;
    default:
      return `
        ${baseStyles}
        <div class="container">
          <div class="header">
            <h1>HR System Notification</h1>
          </div>
          <div class="content">
            <p>You have a new notification from the HR system.</p>
            <a href="${data.loginUrl}" class="button">Login to View</a>
          </div>
        </div>
      `;
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, type, data }: NotificationEmailRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "HR System <notifications@resend.dev>",
      to: [to],
      subject: subject,
      html: getEmailTemplate(type, data),
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending notification email:", error);
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