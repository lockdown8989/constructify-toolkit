
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
        const { employees = [], totalEmployees = 0, activeDepartments = [], activeEmployees = 0 } = data;
        
        prompt = `Create an optimal shift pattern based on these requirements and current employee data:

BUSINESS REQUIREMENTS: ${JSON.stringify(data)}

CURRENT TEAM DATA:
- Total Employees: ${totalEmployees}
- Active Employees: ${activeEmployees}
- Departments: ${activeDepartments.join(', ')}

EMPLOYEE AVAILABILITY:
${employees.map(emp => `
- ${emp.name} (${emp.job_title}, ${emp.department}):
  * Monday: ${emp.availability.monday}
  * Tuesday: ${emp.availability.tuesday}
  * Wednesday: ${emp.availability.wednesday}
  * Thursday: ${emp.availability.thursday}
  * Friday: ${emp.availability.friday}
  * Saturday: ${emp.availability.saturday}
  * Sunday: ${emp.availability.sunday}
`).join('')}

Please analyze the employee availability patterns and business requirements to suggest an optimal shift pattern. Consider:
1. Employee availability windows
2. Department coverage needs
3. Business operating hours
4. Peak time requirements

Respond in JSON format with these exact fields: 
{
  "name": "Pattern name based on analysis",
  "start_time": "HH:MM:SS format",
  "end_time": "HH:MM:SS format", 
  "break_duration": "minutes as integer",
  "grace_period_minutes": "minutes as integer",
  "overtime_threshold_minutes": "minutes as integer",
  "reasoning": "Brief explanation of why this pattern works for the team"
}`;
        break;
        
      case 'optimize_pattern':
        prompt = `Analyze this shift pattern and suggest improvements considering current employee data: ${JSON.stringify(data)}.
        Consider efficiency, employee wellbeing, business needs, and current team availability patterns. 
        Provide specific recommendations for optimization.`;
        break;
        
      case 'assign_shifts':
        prompt = `Given these employees and shift patterns, suggest optimal assignments considering individual availability: ${JSON.stringify(data)}.
        Consider employee availability windows, workload balance, department needs, and coverage requirements.
        Provide recommendations with reasoning based on actual employee availability data.`;
        break;
        
      case 'resolve_conflicts':
        prompt = `Analyze these scheduling conflicts and suggest solutions using current employee data: ${JSON.stringify(data)}.
        Consider employee availability patterns, department coverage, and business requirements.
        Provide practical recommendations to resolve conflicts while maintaining coverage.`;
        break;
        
      default:
        throw new Error('Invalid action specified');
    }

    console.log('Sending prompt to Gemini:', prompt.substring(0, 200) + '...');

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
          maxOutputTokens: 2048,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const result = await response.json();
    const generatedText = result.candidates[0].content.parts[0].text;

    console.log('Gemini response:', generatedText.substring(0, 200) + '...');

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
