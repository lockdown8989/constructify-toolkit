
import { supabase } from '@/integrations/supabase/client';

export const calculateSalaryWithGPT = async (employeeId: string, baseSalary: number) => {
  try {
    const { data, error } = await supabase.functions.invoke('calculate-salary', {
      body: { employeeId, baseSalary }
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
    .select('working_minutes, overtime_minutes')
    .eq('employee_id', employeeId)
    .gte('date', startOfMonth.toISOString())
    .lt('date', new Date().toISOString());

  if (attendanceError) throw attendanceError;

  const workingHours = attendanceData?.reduce((sum, record) => 
    sum + (record.working_minutes || 0) / 60, 0) || 0;
  
  const overtimeHours = attendanceData?.reduce((sum, record) => 
    sum + (record.overtime_minutes || 0) / 60, 0) || 0;

  return { workingHours, overtimeHours };
};
