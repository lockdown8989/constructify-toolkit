
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { baseSalary, employeeId, currency = 'GBP' } = await req.json();

    if (!baseSalary) {
      return new Response(
        JSON.stringify({ error: 'Base salary is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Calculating salary for employee ${employeeId} with base salary ${baseSalary} in ${currency}`);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a helpful assistant that calculates final salary amounts. Return only a number with no formatting or additional text.' 
          },
          { 
            role: 'user', 
            content: `Calculate the final salary for an employee with a base salary of ${baseSalary} ${currency}. 
                     Apply standard tax deductions (assume 20%) and insurance (assume 5%).
                     Return ONLY the final numeric value, without any text, currency symbols or formatting.` 
          }
        ],
        temperature: 0.1, // Low temperature for more deterministic results
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const calculatedSalary = data.choices[0].message.content.trim();
    
    // Parse the number and ensure it's a valid number
    const finalSalary = parseFloat(calculatedSalary.replace(/[^0-9.-]+/g, ''));
    
    if (isNaN(finalSalary)) {
      console.error('Failed to parse calculated salary:', calculatedSalary);
      throw new Error('Failed to calculate a valid salary amount');
    }

    console.log(`Calculated final salary: ${finalSalary} ${currency}`);

    return new Response(
      JSON.stringify({ finalSalary: finalSalary, currency }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in calculate-salary function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
