
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.14.0';
import { corsHeaders } from '../_shared/cors.ts';

console.log("Document upload notification function started");

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the request body
    const { document_id, employee_id } = await req.json();

    if (!document_id || !employee_id) {
      throw new Error('Missing document_id or employee_id');
    }

    // Get document details
    const { data: document, error: documentError } = await supabaseClient
      .from('documents')
      .select('*')
      .eq('id', document_id)
      .single();

    if (documentError) {
      throw documentError;
    }

    // Get employee details including the uploader's information
    const { data: employee, error: employeeError } = await supabaseClient
      .from('employees')
      .select('user_id, name, manager_id')
      .eq('id', employee_id)
      .single();

    if (employeeError) {
      throw employeeError;
    }

    if (!employee.user_id) {
      throw new Error('Employee has no user_id');
    }

    // Format document type for display
    const documentType = document.document_type;
    const formattedDocType = documentType.charAt(0).toUpperCase() + documentType.slice(1);

    // Get uploader's name if available
    let uploaderName = "A manager";
    if (document.uploaded_by) {
      const { data: uploader } = await supabaseClient
        .from('employees')
        .select('name')
        .eq('user_id', document.uploaded_by)
        .single();
      
      if (uploader) {
        uploaderName = uploader.name;
      }
    }

    // Send notification to the employee
    const { error: notificationError } = await supabaseClient
      .from('notifications')
      .insert({
        user_id: employee.user_id,
        title: `New ${formattedDocType} Available`,
        message: `${uploaderName} has uploaded a new ${documentType.toLowerCase()} document (${document.name}) to your profile.`,
        type: 'info',
        related_entity: 'documents',
        related_id: document.id
      });

    if (notificationError) {
      throw notificationError;
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
    console.error('Error in document notification function:', error);
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
