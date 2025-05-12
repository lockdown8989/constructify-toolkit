
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
    const { baseSalary, employeeId, currency = 'GBP', workingHours = 160, overtimeHours = 0 } = await req.json();

    if (!baseSalary) {
      return new Response(
        JSON.stringify({ error: 'Base salary is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Calculating salary for employee ${employeeId} with base salary ${baseSalary} ${currency}`);
    console.log(`Working hours: ${workingHours}, Overtime hours: ${overtimeHours}`);

    if (!openAIApiKey) {
      console.log('OpenAI API key not found, using standard calculation');
      
      // Standard calculation without API
      const hourlyRate = baseSalary / 160; // Assuming 160 hours per month standard
      const regularPay = hourlyRate * workingHours;
      const overtimePay = hourlyRate * 1.5 * overtimeHours;
      const grossSalary = regularPay + overtimePay;
      
      // Standard deductions
      const taxRate = 0.2;
      const insuranceRate = 0.05;
      const otherRate = 0.08;
      
      const taxDeduction = grossSalary * taxRate;
      const insuranceDeduction = grossSalary * insuranceRate;
      const otherDeduction = grossSalary * otherRate;
      
      const finalSalary = grossSalary - (taxDeduction + insuranceDeduction + otherDeduction);
      
      return new Response(
        JSON.stringify({ 
          finalSalary: parseFloat(finalSalary.toFixed(2)), 
          currency,
          method: 'standard',
          details: {
            grossSalary,
            taxDeduction,
            insuranceDeduction,
            otherDeduction
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate using OpenAI
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
            content: 'You are a helpful payroll calculation assistant. Calculate the final salary amount after all deductions.' 
          },
          { 
            role: 'user', 
            content: `Calculate the final net salary for an employee with:
                     - Base salary: ${baseSalary} ${currency}
                     - Working hours: ${workingHours}
                     - Overtime hours: ${overtimeHours} (paid at 1.5x hourly rate)
                     
                     Apply the following deductions:
                     - Tax: 20% of gross salary
                     - National Insurance: 5% of gross salary
                     - Other deductions: 8% of gross salary
                     
                     Return ONLY the final numeric value representing net salary after all deductions, without any text, currency symbols or formatting.` 
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

    // Calculate estimated components for informational purposes
    const hourlyRate = baseSalary / 160;
    const regularPay = hourlyRate * workingHours;
    const overtimePay = hourlyRate * 1.5 * overtimeHours;
    const grossSalary = regularPay + overtimePay;
    
    return new Response(
      JSON.stringify({ 
        finalSalary: finalSalary, 
        currency,
        method: 'openai',
        details: {
          grossSalary,
          regularPay,
          overtimePay,
          estimatedDeductions: grossSalary - finalSalary
        }
      }),
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
