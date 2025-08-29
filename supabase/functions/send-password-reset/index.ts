
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://fphmujxruswmvlwceodl.supabase.co",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Rate limiting storage
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting function
function checkRateLimit(identifier: string, maxAttempts: number = 3, windowMs: number = 900000): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxAttempts) {
    return false;
  }
  
  record.count++;
  return true;
}

// Input validation function
function validateEmail(email: string): { isValid: boolean; sanitized: string } {
  if (!email || typeof email !== "string") {
    return { isValid: false, sanitized: "" };
  }
  
  const sanitized = email.trim().toLowerCase();
  
  if (sanitized.length > 254) {
    return { isValid: false, sanitized };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return { isValid: emailRegex.test(sanitized), sanitized };
}

interface PasswordResetRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    const { email }: PasswordResetRequest = await req.json();

    // Input validation with sanitization
    const { isValid, sanitized } = validateEmail(email);
    if (!isValid) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Rate limiting by IP and email
    const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const emailKey = `email:${sanitized}`;
    const ipKey = `ip:${clientIP}`;
    
    if (!checkRateLimit(emailKey, 3, 900000) || !checkRateLimit(ipKey, 5, 900000)) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "If an account with this email exists, you will receive a password reset link." 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Processing password reset for email:", email);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // First, check if the user exists in our database
    console.log("Checking if user exists in database...");
    const { data: existingUser, error: userCheckError } = await supabase
      .from('profiles')
      .select('id')
      .ilike('email', email.trim())
      .maybeSingle();

    if (userCheckError) {
      console.error("Error checking user existence:", userCheckError);
    }

    console.log("User check result:", { existingUser, userCheckError });

    // Generate reset token using Supabase Auth Admin API
    console.log("Generating password reset link...");
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${Deno.env.get("SUPABASE_URL")?.includes('supabase.co') ? 
          `https://${Deno.env.get("SUPABASE_URL")?.split('//')[1]?.split('.')[0]}.lovableproject.com` : 
          'http://localhost:3000'}/auth?type=recovery`,
      }
    });

    if (error) {
      console.error("Error generating reset link:", error);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "If an account with this email exists, you will receive a password reset link." 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (data?.properties?.action_link) {
      const resetLink = data.properties.action_link;
      console.log("Sending password reset email to:", email);
      
      // Use a verified sender email - you need to verify this domain in Resend
      // For testing, we'll use the default Resend domain
      const emailResponse = await resend.emails.send({
        from: "TeamPulse <onboarding@resend.dev>", // Using Resend's default verified domain
        to: [email],
        subject: "Reset Your TeamPulse Password",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #333; font-size: 32px; margin-bottom: 10px;">TeamPulse</h1>
              <p style="color: #666; font-size: 16px;">HR Management Platform</p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
              <h2 style="color: #333; font-size: 24px; margin-bottom: 20px;">Reset Your Password</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 25px;">
                We received a request to reset your password for your TeamPulse account. Click the button below to create a new password:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" 
                   style="background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                  Reset Password
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px; line-height: 1.5; margin-top: 25px;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${resetLink}" style="color: #3b82f6; word-break: break-all;">${resetLink}</a>
              </p>
            </div>
            
            <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 14px; margin-bottom: 10px;">
                This link will expire in 1 hour for security reasons.
              </p>
              <p style="color: #9ca3af; font-size: 14px;">
                If you didn't request this password reset, you can safely ignore this email.
              </p>
            </div>
          </div>
        `,
      });

      console.log("Password reset email response:", emailResponse);
      
      if (emailResponse.error) {
        console.error("Resend error details:", emailResponse.error);
        
        // Check if it's a domain verification error
        if (emailResponse.error.message?.includes('domain') || emailResponse.error.message?.includes('verify')) {
          console.error("Domain verification required for Resend");
          // Still return success for security, but log the actual error
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: "If an account with this email exists, you will receive a password reset link.",
              debug: "Email service configuration needed - check Resend domain verification"
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json", ...corsHeaders },
            }
          );
        }
        
        throw new Error(`Email delivery failed: ${emailResponse.error.message}`);
      }

      console.log("Email sent successfully with ID:", emailResponse.data?.id);
    }

    // Always return success for security (don't reveal if email exists)
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "If an account with this email exists, you will receive a password reset link." 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-password-reset function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Unable to process password reset request",
        message: "If an account with this email exists, you will receive a password reset link."
      }),
      {
        status: 200, // Return 200 for security
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
