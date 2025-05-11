
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.22.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DocumentAssignmentRequest {
  documentId: string;
  employeeId: string;
  isRequired?: boolean;
  dueDate?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Initialize Supabase client with Deno fetch
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
    
    // Get the authenticated user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      throw new Error("User not authenticated");
    }
    
    console.log("Processing document assignment for user:", user.id);
    
    // Check if user has appropriate role
    const { data: userRoles, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);
      
    if (roleError) {
      throw roleError;
    }
    
    const isManager = userRoles?.some(r => ['admin', 'hr', 'employer'].includes(r.role));
    
    if (!isManager) {
      return new Response(JSON.stringify({ 
        success: false,
        message: "Unauthorized. Only managers can assign documents to employees." 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      });
    }
    
    // Parse request
    const { documentId, employeeId, isRequired = false, dueDate } = await req.json() as DocumentAssignmentRequest;
    
    if (!documentId || !employeeId) {
      return new Response(
        JSON.stringify({ success: false, message: "Document ID and Employee ID are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Verify the document exists
    const { data: document, error: documentError } = await supabaseClient
      .from('documents')
      .select('id, name, document_type')
      .eq('id', documentId)
      .single();
      
    if (documentError || !document) {
      console.error('Error verifying document:', documentError);
      return new Response(
        JSON.stringify({ success: false, message: "Document not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Verify the employee exists
    const { data: employee, error: employeeError } = await supabaseClient
      .from('employees')
      .select('id, user_id, name')
      .eq('id', employeeId)
      .single();
      
    if (employeeError || !employee) {
      console.error('Error verifying employee:', employeeError);
      return new Response(
        JSON.stringify({ success: false, message: "Employee not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Create document assignment
    const { data: assignment, error: assignmentError } = await supabaseClient
      .from('document_assignments')
      .insert({
        document_id: documentId,
        employee_id: employeeId,
        assigned_by: user.id,
        is_required: isRequired,
        due_date: dueDate,
        status: 'pending'
      })
      .select('id')
      .single();
      
    if (assignmentError) {
      console.error('Error creating document assignment:', assignmentError);
      return new Response(JSON.stringify({ 
        success: false,
        message: `Failed to assign document: ${assignmentError.message}` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }
    
    // Send notification to employee
    if (employee.user_id) {
      const { error: notificationError } = await supabaseClient
        .from('notifications')
        .insert({
          user_id: employee.user_id,
          title: `Document Assignment: ${document.name}`,
          message: `A ${document.document_type} document has been assigned to you${isRequired ? ' (action required)' : ''}`,
          type: 'info',
          related_entity: 'documents',
          related_id: document.id
        });
        
      if (notificationError) {
        console.error('Error creating notification:', notificationError);
      }
    }
    
    return new Response(JSON.stringify({ 
      success: true,
      message: "Document assigned successfully",
      data: { assignmentId: assignment.id }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in document assignment function:", error.message);
    
    return new Response(JSON.stringify({ 
      success: false,
      message: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
