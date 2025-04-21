
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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
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

    // Get employee details
    const { data: employee, error: employeeError } = await supabaseClient
      .from('employees')
      .select('user_id, name')
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

    // Send notification
    const { error: notificationError } = await supabaseClient
      .from('notifications')
      .insert({
        user_id: employee.user_id,
        title: `New ${formattedDocType} Uploaded`,
        message: `A new ${documentType.toLowerCase()} document (${document.name}) has been uploaded to your profile.`,
        type: 'info',
        related_entity: 'documents',
        related_id: document.id.toString()
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
