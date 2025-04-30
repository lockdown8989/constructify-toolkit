
import { supabase } from '@/integrations/supabase/client';
import { useCurrencyPreference } from '@/hooks/use-currency-preference';

export const calculateSalaryWithGPT = async (employeeId: string, baseSalary: number, currency: string = 'USD') => {
  try {
    const { data, error } = await supabase.functions.invoke('calculate-salary', {
      body: { employeeId, baseSalary, currency }
    });

    if (error) throw error;
    return data.finalSalary;
  } catch (err) {
    console.error('Error in calculateSalaryWithGPT:', err);
    return baseSalary * 0.75; // Fallback calculation
  }
};

export const getEmployeeAttendance = async (employeeId: string) => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: attendanceData, error: attendanceError } = await supabase
    .from('attendance')
    .select('working_minutes, overtime_minutes, hourly_rate, currency')
    .eq('employee_id', employeeId)
    .gte('date', startOfMonth.toISOString())
    .lt('date', new Date().toISOString());

  if (attendanceError) throw attendanceError;

  const workingHours = attendanceData?.reduce((sum, record) => 
    sum + (record.working_minutes || 0) / 60, 0) || 0;
  
  const overtimeHours = attendanceData?.reduce((sum, record) => 
    sum + (record.overtime_minutes || 0) / 60, 0) || 0;
    
  // Calculate pay based on hourly rate if available
  const totalPay = attendanceData?.reduce((sum, record) => {
    const rate = record.hourly_rate || 0;
    const workingTime = (record.working_minutes || 0) / 60;
    const overtimeTime = (record.overtime_minutes || 0) / 60;
    
    return sum + (workingTime * rate) + (overtimeTime * rate * 1.5); // Overtime at 1.5x
  }, 0) || 0;
  
  // Find most commonly used currency
  const currencies = attendanceData?.map(record => record.currency).filter(Boolean);
  const currencyCount = currencies?.reduce((acc, curr) => {
    if (!curr) return acc;
    acc[curr] = (acc[curr] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const mostUsedCurrency = currencyCount && Object.keys(currencyCount).length > 0 
    ? Object.keys(currencyCount).reduce((a, b) => currencyCount[a] > currencyCount[b] ? a : b) 
    : 'GBP';

  return { 
    workingHours, 
    overtimeHours, 
    totalPay,
    currency: mostUsedCurrency || 'GBP'  
  };
};

export const convertCurrency = async (amount: number, fromCurrency: string, toCurrency: string) => {
  if (fromCurrency === toCurrency) return amount;
  
  // Simple conversion rates (in real app, you'd use an API)
  const rates = {
    'USD': { 'GBP': 0.79, 'EUR': 0.93 },
    'GBP': { 'USD': 1.27, 'EUR': 1.18 },
    'EUR': { 'USD': 1.07, 'GBP': 0.85 }
  };
  
  const rate = rates[fromCurrency as keyof typeof rates]?.[toCurrency as keyof typeof rates[keyof typeof rates]];
  if (!rate) return amount; // Return original if conversion not available
  
  return amount * rate;
};
