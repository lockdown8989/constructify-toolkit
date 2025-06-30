
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { action, timeRange = 'month' } = await req.json();

    // Get current payroll data
    const { data: payrollData, error: payrollError } = await supabase
      .from('payroll')
      .select(`
        *,
        employees (
          name,
          job_title,
          department,
          salary
        )
      `)
      .gte('payment_date', getTimeRangeDate(timeRange));

    if (payrollError) throw payrollError;

    // Get employee count
    const { count: employeeCount } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Active');

    // Process data with OpenAI for insights
    const prompt = `
    Analyze this payroll data and provide insights:
    
    Payroll Records: ${JSON.stringify(payrollData?.slice(0, 10) || [])}
    Total Active Employees: ${employeeCount || 0}
    Time Range: ${timeRange}
    
    Calculate and return JSON with:
    1. totalPayroll (sum of all salary_paid)
    2. totalOvertime (sum of all overtime_pay) 
    3. totalBonuses (sum of all bonus amounts)
    4. averageSalary
    5. insights (brief analysis)
    6. trends (month-over-month changes)
    
    Return only valid JSON.
    `;

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a payroll data analyst. Return only valid JSON responses.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
      }),
    });

    const aiResult = await openAIResponse.json();
    const analysis = JSON.parse(aiResult.choices[0].message.content);

    // Calculate actual totals from database
    const actualTotals = {
      totalPayroll: payrollData?.reduce((sum, record) => sum + (record.salary_paid || 0), 0) || 0,
      totalOvertime: payrollData?.reduce((sum, record) => sum + (record.overtime_pay || 0), 0) || 0,
      totalBonuses: payrollData?.reduce((sum, record) => sum + (record.bonus || 0), 0) || 0,
      totalEmployees: employeeCount || 0,
      paidEmployees: payrollData?.filter(record => record.payment_status === 'Paid').length || 0,
      pendingEmployees: payrollData?.filter(record => record.payment_status === 'Pending').length || 0,
    };

    return new Response(JSON.stringify({
      success: true,
      data: {
        ...actualTotals,
        analysis: analysis,
        chartData: generateChartData(payrollData, timeRange),
        lastUpdated: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in process-payroll-data:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getTimeRangeDate(timeRange: string): string {
  const now = new Date();
  
  switch (timeRange) {
    case 'day':
      return new Date(now.setHours(0, 0, 0, 0)).toISOString();
    case 'week':
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      return weekAgo.toISOString();
    case 'month':
    default:
      const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
      return monthAgo.toISOString();
  }
}

function generateChartData(payrollData: any[], timeRange: string) {
  if (!payrollData) return [];
  
  const groupedData = payrollData.reduce((acc, record) => {
    const date = new Date(record.payment_date);
    let key = '';
    
    switch (timeRange) {
      case 'day':
        key = date.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
      default:
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
    }
    
    if (!acc[key]) {
      acc[key] = {
        period: key,
        totalPayroll: 0,
        overtime: 0,
        bonuses: 0
      };
    }
    
    acc[key].totalPayroll += record.salary_paid || 0;
    acc[key].overtime += record.overtime_pay || 0;
    acc[key].bonuses += record.bonus || 0;
    
    return acc;
  }, {});
  
  return Object.values(groupedData).sort((a: any, b: any) => 
    a.period.localeCompare(b.period)
  );
}
