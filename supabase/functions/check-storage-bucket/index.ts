
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.22.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    
    console.log("Checking for documents bucket...");
    
    // Get all buckets
    const { data: buckets, error: bucketsError } = await supabaseClient.storage.listBuckets();
    
    if (bucketsError) {
      throw bucketsError;
    }
    
    // Check if documents bucket exists
    const documentsBucket = buckets.find(b => b.name === 'documents');
    
    if (!documentsBucket) {
      console.log("Documents bucket not found. Creating it now...");
      const { error: createError } = await supabaseClient.storage.createBucket('documents', {
        public: true,
        fileSizeLimit: 10485760 // 10MB
      });
      
      if (createError) {
        throw createError;
      }
      
      console.log("Documents bucket created successfully.");
      
      // Create RLS policies for the documents bucket
      const { error: policyError } = await supabaseClient.rpc('create_storage_policies');
      
      if (policyError) {
        console.error("Error creating policies:", policyError);
      }
      
      return new Response(JSON.stringify({ 
        message: "Documents bucket created successfully", 
        created: true 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }
    
    return new Response(JSON.stringify({ 
      message: "Documents bucket already exists", 
      created: false 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in check-storage-bucket function:", error.message);
    
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
