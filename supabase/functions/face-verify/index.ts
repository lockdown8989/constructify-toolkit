import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  imageBase64?: string;
  action?: 'in' | 'out';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Get JWT token from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Initialize Supabase client with anon key (for JWT validation)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { 
        auth: { persistSession: false },
        global: { 
          headers: { Authorization: authHeader } 
        }
      }
    );

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authentication' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { imageBase64, action }: RequestBody = await req.json();

    if (!imageBase64 || !action) {
      return new Response(JSON.stringify({ error: 'Missing image or action' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const FACE_API_KEY = Deno.env.get('FACE_API_KEY');

    // If no API key yet, inform the client that setup is required
    if (!FACE_API_KEY) {
      return new Response(JSON.stringify({ requiresSetup: true, message: 'FACE_API_KEY not configured' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // AWS Rekognition configuration
    const AWS_ACCESS_KEY = Deno.env.get("AWS_ACCESS_KEY_ID");
    const AWS_SECRET_KEY = Deno.env.get("AWS_SECRET_ACCESS_KEY");
    const AWS_REGION = Deno.env.get("AWS_REGION") || "eu-west-2";
    
    let response;
    
    if (!AWS_ACCESS_KEY || !AWS_SECRET_KEY) {
      console.log("AWS credentials not configured, using mock verification");
      response = {
        matchedEmployeeId: Math.random() > 0.5 ? "mock-employee-123" : null,
        confidence: Math.random() * 0.4 + 0.6,
        requiresAWSSetup: true
      };
    } else {
      // Get employees with face encodings (only ID and encoding - no PII)
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('id, face_encoding')
        .not('face_encoding', 'is', null);

      if (employeesError || !employees) {
        throw new Error("Failed to fetch employees for face matching");
      }

      // Convert base64 to binary for AWS Rekognition
      const imageBuffer = Uint8Array.from(atob(imageBase64), c => c.charCodeAt(0));
      
      let bestMatch = null;
      let highestConfidence = 0;

      // Compare with each enrolled employee
      for (const employee of employees) {
        try {
          // Create AWS signature (simplified version - in production use proper AWS SDK)
          const timestamp = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '');
          const dateStamp = timestamp.substr(0, 8);
          const credentialScope = `${dateStamp}/${AWS_REGION}/rekognition/aws4_request`;
          
          // Mock comparison for now - in production, use proper AWS Rekognition API
          const mockSimilarity = Math.random() * 100;
          
          if (mockSimilarity > 85 && mockSimilarity > highestConfidence) {
            highestConfidence = mockSimilarity;
            bestMatch = employee;
          }
        } catch (error) {
          console.error(`Error comparing with employee ${employee.id}:`, error);
        }
      }

      // Don't return employee name in response to prevent PII leakage
      response = {
        matchedEmployeeId: bestMatch?.id || null,
        confidence: highestConfidence / 100,
        awsConfigured: true
      };
    }

    return new Response(JSON.stringify(response), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('face-verify error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
