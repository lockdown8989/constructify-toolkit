
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.22.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Initialize Supabase client with Deno fetch
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
    
    // Check for the documents bucket
    const { data: buckets, error: bucketError } = await supabaseClient.storage.listBuckets();
    
    if (bucketError) {
      throw bucketError;
    }
    
    const documentsBucket = buckets.find(b => b.name === 'documents');
    
    // Create the bucket if it doesn't exist
    if (!documentsBucket) {
      console.log('Documents bucket not found. Creating it now...');
      const { error: createError } = await supabaseClient.storage.createBucket('documents', {
        public: true,
        fileSizeLimit: 10485760 // 10MB limit
      });
      
      if (createError) {
        throw createError;
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Documents bucket created successfully',
          created: true
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 201
        }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Documents bucket exists',
        created: false
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );
    
  } catch (error) {
    console.error('Error checking/creating storage bucket:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        message: error.message
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
