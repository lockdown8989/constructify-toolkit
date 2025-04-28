
import { supabase } from '@/integrations/supabase/client';
import { exportToCSV } from '@/utils/exports';

export const exportPayrollData = async () => {
  const { data, error } = await supabase
    .from("payroll")
    .select(`
      id,
      salary_paid,
      payment_status,
      payment_date,
      employee_id,
      employees(name, job_title)
    `);

  if (error) throw error;

  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  const exportData = data.map(row => {
    const employeeName = row.employees && typeof row.employees === 'object' && !Array.isArray(row.employees) 
      ? (row.employees as { name: string }).name 
      : 'Unknown';
      
    const employeeJob = row.employees && typeof row.employees === 'object' && !Array.isArray(row.employees) 
      ? (row.employees as { job_title: string }).job_title
      : 'Unknown';

    return {
      ID: row.id,
      Employee: employeeName,
      Position: employeeJob,
      'Employee ID': row.employee_id,
      'Net Salary': row.salary_paid,
      'Payment Date': row.payment_date,
      Status: row.payment_status
    };
  });

  exportToCSV(
    exportData,
    `payslips_report_${new Date().toISOString().split('T')[0]}`,
    {
      ID: 'ID',
      Employee: 'Employee Name',
      Position: 'Job Title',
      'Employee ID': 'Employee ID',
      'Net Salary': 'Net Salary',
      'Payment Date': 'Payment Date',
      Status: 'Payment Status'
    }
  );
};
