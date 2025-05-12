
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// UK Tax Rates for 2024/2025
const UK_TAX_RATES = {
  personalAllowance: 12570,
  basicRateUpper: 50270,
  higherRateUpper: 125140,
  basicRate: 0.2,      // 20%
  higherRate: 0.4,     // 40%
  additionalRate: 0.45 // 45%
};

// Calculate UK income tax based on annual salary
function calculateUKIncomeTax(annualSalary) {
  // Convert to annual equivalent if needed
  const yearlyEquivalent = annualSalary;
  let taxDue = 0;
  
  // No personal allowance for very high earners
  const personalAllowance = yearlyEquivalent > 125140 ? 0 : 
                           yearlyEquivalent > 100000 ? Math.max(0, UK_TAX_RATES.personalAllowance - (yearlyEquivalent - 100000) / 2) : 
                           UK_TAX_RATES.personalAllowance;
  
  // Calculate tax for each band
  if (yearlyEquivalent > personalAllowance) {
    // Basic rate (20%)
    const basicRateTaxable = Math.min(UK_TAX_RATES.basicRateUpper - personalAllowance, yearlyEquivalent - personalAllowance);
    if (basicRateTaxable > 0) {
      taxDue += basicRateTaxable * UK_TAX_RATES.basicRate;
    }
    
    // Higher rate (40%)
    if (yearlyEquivalent > UK_TAX_RATES.basicRateUpper) {
      const higherRateTaxable = Math.min(UK_TAX_RATES.higherRateUpper - UK_TAX_RATES.basicRateUpper, 
                                       yearlyEquivalent - UK_TAX_RATES.basicRateUpper);
      if (higherRateTaxable > 0) {
        taxDue += higherRateTaxable * UK_TAX_RATES.higherRate;
      }
      
      // Additional rate (45%)
      if (yearlyEquivalent > UK_TAX_RATES.higherRateUpper) {
        const additionalRateTaxable = yearlyEquivalent - UK_TAX_RATES.higherRateUpper;
        taxDue += additionalRateTaxable * UK_TAX_RATES.additionalRate;
      }
    }
  }
  
  // Return monthly tax (dividing by 12)
  return taxDue / 12;
}

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
      console.log('OpenAI API key not found, using standard calculation with UK tax rates');
      
      // Standard calculation with UK tax rates
      const hourlyRate = baseSalary / 160; // Assuming 160 hours per month standard
      const regularPay = hourlyRate * workingHours;
      const overtimePay = hourlyRate * 1.5 * overtimeHours;
      const grossSalary = regularPay + overtimePay;
      
      // Calculate monthly UK income tax
      const monthlyTaxDue = calculateUKIncomeTax(baseSalary * 12) * (grossSalary / baseSalary);
      
      // Standard NI and other deductions
      const insuranceRate = 0.05;
      const otherRate = 0.08;
      
      const insuranceDeduction = grossSalary * insuranceRate;
      const otherDeduction = grossSalary * otherRate;
      
      const finalSalary = grossSalary - (monthlyTaxDue + insuranceDeduction + otherDeduction);
      
      return new Response(
        JSON.stringify({ 
          finalSalary: parseFloat(finalSalary.toFixed(2)), 
          currency,
          method: 'uk-tax-rates',
          details: {
            grossSalary,
            taxDeduction: monthlyTaxDue,
            insuranceDeduction,
            otherDeduction
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate using OpenAI with UK tax rate information
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
            content: 'You are a helpful UK payroll calculation assistant. Calculate the final salary amount after all deductions using the UK tax rates.' 
          },
          { 
            role: 'user', 
            content: `Calculate the final net salary for an employee with:
                     - Annual base salary: ${baseSalary * 12} ${currency}
                     - Monthly base salary: ${baseSalary} ${currency}
                     - Working hours: ${workingHours}
                     - Overtime hours: ${overtimeHours} (paid at 1.5x hourly rate)
                     
                     Apply the UK tax rates and bands:
                     - Personal Allowance: Up to £12,570 - 0%
                     - Basic rate: £12,571 to £50,270 - 20%
                     - Higher rate: £50,271 to £125,140 - 40%
                     - Additional rate: over £125,140 - 45%
                     
                     Additionally apply:
                     - National Insurance: 5% of gross salary
                     - Other deductions: 8% of gross salary
                     
                     Return ONLY the final numeric value representing monthly net salary after all deductions, without any text, currency symbols or formatting.` 
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
        method: 'openai-uk-tax',
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
