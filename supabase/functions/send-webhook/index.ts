
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type WebhookType = 'slack' | 'email';

interface WebhookPayload {
  webhookType: WebhookType;
  webhookUrl: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const payload: WebhookPayload = await req.json();
    const { webhookType, webhookUrl, title, message, data = {} } = payload;
    
    console.log(`Sending ${webhookType} webhook notification:`, { title, message });
    
    if (!webhookUrl) {
      return new Response(
        JSON.stringify({ error: 'Webhook URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    let response;
    
    if (webhookType === 'slack') {
      // Format the payload for Slack
      const slackPayload = {
        text: `*${title}*\n${message}`,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*${title}*\n${message}`
            }
          }
        ]
      };
      
      if (Object.keys(data).length > 0) {
        slackPayload.blocks.push({
          type: "section",
          fields: Object.entries(data).map(([key, value]) => ({
            type: "mrkdwn",
            text: `*${key}:*\n${value}`
          }))
        });
      }
      
      // Send to Slack webhook
      response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slackPayload)
      });
    } else if (webhookType === 'email') {
      // For email webhooks (like Zapier email webhooks)
      response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: title,
          body: message,
          ...data
        })
      });
    } else {
      return new Response(
        JSON.stringify({ error: 'Unsupported webhook type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Webhook error (${response.status}):`, errorText);
      return new Response(
        JSON.stringify({ error: `Webhook error: ${response.status}`, details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ success: true, message: `${webhookType} notification sent successfully` }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Webhook function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
