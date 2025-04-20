
// This edge function will retrieve employee documents from storage
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestParams {
  employeeId: string;
  documentType?: 'payslip' | 'contract' | 'all';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received request to get-employee-documents");
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Parse request
    const { employeeId, documentType = 'all' } = await req.json() as RequestParams;

    if (!employeeId) {
      return new Response(
        JSON.stringify({ error: "Employee ID is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Fetching documents for employee ${employeeId}, type: ${documentType}`);
    
    // First check if the documents bucket exists
    const { data: buckets, error: bucketError } = await supabaseClient
      .storage
      .listBuckets();
      
    if (bucketError) {
      console.error('Error checking storage buckets:', bucketError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: `Storage error: ${bucketError.message}` 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }
    
    console.log('Available buckets:', buckets.map(b => b.name).join(', '));
    
    // Get employee documents from storage
    let documents = [];
    
    // First, check for documents in the documents table
    const { data: documentRecords, error: documentError } = await supabaseClient
      .from('documents')
      .select('*')
      .eq('employee_id', employeeId);

    if (documentError) {
      console.error('Error fetching document records:', documentError);
    } else if (documentRecords && documentRecords.length > 0) {
      console.log(`Found ${documentRecords.length} documents in the documents table`);
      
      // Filter by document type if specified
      const filteredDocs = documentType !== 'all' 
        ? documentRecords.filter(doc => doc.document_type.toLowerCase() === documentType) 
        : documentRecords;
      
      // Get public URLs for each document
      for (const doc of filteredDocs) {
        if (doc.path) {
          const { data: urlData } = supabaseClient.storage
            .from('documents')
            .getPublicUrl(doc.path);
          
          documents.push({
            ...doc,
            url: urlData.publicUrl
          });
        }
      }
    }

    // Also check for documents in payroll table
    if (documentType === 'all' || documentType === 'payslip') {
      const { data: payslips, error: payslipError } = await supabaseClient
        .from('payroll')
        .select('id, employee_id, payment_date, document_url, document_name')
        .eq('employee_id', employeeId)
        .not('document_url', 'is', null);
        
      if (payslipError) {
        console.error('Error fetching payslips:', payslipError);
      } else if (payslips && payslips.length > 0) {
        console.log(`Found ${payslips.length} payslips in the payroll table`);
        
        // Get public URLs for each payslip
        for (const payslip of payslips) {
          if (payslip.document_url) {
            try {
              const { data: urlData } = supabaseClient.storage
                .from('documents')
                .getPublicUrl(payslip.document_url);
                
              documents.push({
                id: payslip.id,
                employee_id: payslip.employee_id,
                document_type: 'payslip',
                name: payslip.document_name || `Payslip - ${payslip.payment_date}`,
                path: payslip.document_url,
                url: urlData.publicUrl,
                created_at: payslip.payment_date
              });
            } catch (error) {
              console.error(`Error getting URL for payslip ${payslip.id}:`, error);
            }
          }
        }
      }
    }

    console.log(`Returning ${documents.length} documents total`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: documents 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in get-employee-documents function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
