
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

console.log("Hello from notify-on-document-upload!");

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    console.log('CORS preflight request');
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    const { document_id, employee_id } = await req.json();
    console.log(`Received notification request for document: ${document_id} and employee: ${employee_id}`);

    const supabaseAdminUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseAdminUrl || !supabaseServiceKey) {
      throw new Error('Supabase admin URL or service key not found');
    }

    // Get employee information to retrieve user_id
    const employeeResponse = await fetch(`${supabaseAdminUrl}/rest/v1/employees?id=eq.${employee_id}&select=user_id`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseServiceKey}`,
        "apikey": supabaseServiceKey
      }
    });

    const employeeData = await employeeResponse.json();
    
    if (!employeeData || employeeData.length === 0) {
      throw new Error(`Employee with ID ${employee_id} not found`);
    }
    
    const user_id = employeeData[0].user_id;
    
    if (!user_id) {
      throw new Error(`No user_id found for employee ${employee_id}`);
    }
    
    // Get document information
    const documentResponse = await fetch(`${supabaseAdminUrl}/rest/v1/documents?id=eq.${document_id}&select=name,document_type`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseServiceKey}`,
        "apikey": supabaseServiceKey
      }
    });
    
    const documentData = await documentResponse.json();
    
    if (!documentData || documentData.length === 0) {
      throw new Error(`Document with ID ${document_id} not found`);
    }
    
    const docName = documentData[0].name;
    const docType = documentData[0].document_type;
    
    // Create notification
    const notificationData = {
      user_id,
      title: 'New Document Uploaded',
      message: `A new ${docType} document named "${docName}" has been uploaded to your profile.`,
      type: 'info',
      related_entity: 'documents',
      related_id: document_id
    };
    
    const notificationResponse = await fetch(`${supabaseAdminUrl}/rest/v1/notifications`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseServiceKey}`,
        "apikey": supabaseServiceKey
      },
      body: JSON.stringify(notificationData)
    });
    
    if (!notificationResponse.ok) {
      const error = await notificationResponse.json();
      throw new Error(`Failed to create notification: ${JSON.stringify(error)}`);
    }
    
    console.log('Document notification sent successfully');
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Error in notification webhook:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
