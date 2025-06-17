
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, data } = await req.json();

    let prompt = '';
    
    switch (action) {
      case 'generate_pattern':
        prompt = `Create an optimal shift pattern based on these requirements: ${JSON.stringify(data)}. 
        Please suggest: 
        1. Pattern name
        2. Start and end times
        3. Break duration in minutes
        4. Grace period in minutes
        5. Overtime threshold in minutes
        
        Respond in JSON format with these exact fields: name, start_time, end_time, break_duration, grace_period_minutes, overtime_threshold_minutes`;
        break;
        
      case 'optimize_pattern':
        prompt = `Analyze this shift pattern and suggest improvements: ${JSON.stringify(data)}.
        Consider efficiency, employee wellbeing, and business needs. 
        Provide specific recommendations for optimization.`;
        break;
        
      case 'assign_shifts':
        prompt = `Given these employees and shift patterns, suggest optimal assignments: ${JSON.stringify(data)}.
        Consider employee availability, workload balance, and coverage needs.
        Provide recommendations with reasoning.`;
        break;
        
      case 'resolve_conflicts':
        prompt = `Analyze these scheduling conflicts and suggest solutions: ${JSON.stringify(data)}.
        Provide practical recommendations to resolve conflicts while maintaining coverage.`;
        break;
        
      default:
        throw new Error('Invalid action specified');
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const result = await response.json();
    const generatedText = result.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ 
      success: true, 
      result: generatedText,
      action 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in gemini-shift-assistant function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
