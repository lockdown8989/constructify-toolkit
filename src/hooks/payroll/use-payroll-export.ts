import { supabase } from '@/integrations/supabase/client';
import { getManagerUserIds } from '@/services/notifications/role-utils';
import { sendNotificationsToMany } from '@/services/notifications/notification-sender';
import { formatCurrency, formatDate } from '@/utils/format';

export const exportPayrollData = async (currency: string) => {
  try {
    // Get all payroll records
    const { data: payrollData, error: payrollError } = await supabase
      .from('payroll')
      .select(`
        id,
        employee_id,
        base_pay,
        salary_paid,
        deductions,
        working_hours,
        overtime_hours,
        overtime_pay,
        payment_status,
        payment_date,
        employees:employee_id (
          name,
          job_title,
          department
        )
      `)
      .eq('payment_status', 'Paid');
      
    if (payrollError) throw payrollError;
    
    if (!payrollData || payrollData.length === 0) {
      throw new Error('No payroll data available to export');
    }
    
    // Format data for CSV export
    const csvData = payrollData.map(record => {
      // Fix the issue with accessing nested properties
      const employee = record.employees as any; // Type assertion to access nested fields
      
      return {
        'Employee Name': employee ? employee.name : 'Unknown',
        'Position': employee ? employee.job_title : 'Unknown',
        'Department': employee ? employee.department : 'Unknown',
        'Base Pay': formatCurrency(record.base_pay || 0, currency),
        'Net Salary': formatCurrency(record.salary_paid || 0, currency),
        'Deductions': formatCurrency(record.deductions || 0, currency),
        'Overtime Pay': formatCurrency(record.overtime_pay || 0, currency),
        'Working Hours': record.working_hours || 0,
        'Overtime Hours': record.overtime_hours || 0,
        'Payment Date': formatDate(record.payment_date),
        'Status': record.payment_status
      };
    });
    
    // Generate and download CSV file
    const csv = await generateCSV(csvData);
    downloadCSV(csv, `payroll_export_${new Date().toISOString().slice(0, 10)}.csv`);
    
    // Notify managers about the export
    const managerIds = await getManagerUserIds();
    await sendNotificationsToMany(managerIds, {
      title: 'Payroll Data Exported',
      message: `Payroll data has been exported for ${payrollData.length} employees.`,
      type: 'info',
      related_entity: 'payroll'
    });
    
    return true;
  } catch (error) {
    console.error('Error exporting payroll data:', error);
    throw error;
  }
};

async function generateCSV(data: any[]): Promise<string> {
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header as keyof typeof row];
        // Wrap values in quotes if they contain commas
        return typeof value === 'string' && value.includes(',') ? 
          `"${value}"` : value;
      }).join(',')
    )
  ].join('\n');
  return csvContent;
}

function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
