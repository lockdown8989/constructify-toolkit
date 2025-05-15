
import { Employee } from '@/types/employee';
import { PayrollRecord } from '@/types/supabase/payroll';

export const generateCSV = (data: any[], filename: string) => {
  // Get headers from first data item
  if (!data || data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(fieldName => {
        const field = row[fieldName]?.toString() || '';
        // Handle fields with commas by wrapping in quotes
        return field.includes(',') ? `"${field}"` : field;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportPayrollToCSV = (payrollData: PayrollRecord[], filename = 'payroll-export.csv') => {
  const formattedData = payrollData.map(record => ({
    'Employee ID': record.employee_id,
    'Employee Name': record.employee_name || 'Unknown', // Use employee_name which we added to the type
    'Payment Date': record.payment_date,
    'Working Hours': record.working_hours,
    'Overtime Hours': record.overtime_hours,
    'Base Pay': record.base_pay,
    'Overtime Pay': record.overtime_pay,
    'Bonus': record.bonus,
    'Deductions': record.deductions,
    'Total Paid': record.salary_paid,
    'Payment Status': record.payment_status
  }));
  
  generateCSV(formattedData, filename);
};
