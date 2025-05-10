
import { supabase } from '@/integrations/supabase/client';
import { getManagerUserIds } from '@/services/notifications/role-utils';
import { sendNotificationsToMany } from '@/services/notifications/notification-sender';
import { formatCurrency } from '@/utils/format';

export const exportPayrollData = async (currency: string = 'GBP') => {
  try {
    // Fetch all payroll data for the current month
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
    
    const { data: payrollData, error } = await supabase
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
      .gte('payment_date', firstDayOfMonth)
      .lte('payment_date', lastDayOfMonth)
      .order('payment_date', { ascending: false });
      
    if (error) throw error;
    
    if (!payrollData || payrollData.length === 0) {
      throw new Error('No payroll data available to export');
    }
    
    // Transform data for CSV export
    const csvData = payrollData.map(record => ({
      'Employee Name': record.employees?.name || 'Unknown',
      'Job Title': record.employees?.job_title || 'N/A',
      'Department': record.employees?.department || 'N/A',
      'Base Salary': formatCurrency(record.base_pay || 0, currency),
      'Net Pay': formatCurrency(record.salary_paid || 0, currency),
      'Working Hours': record.working_hours || 0,
      'Overtime Hours': record.overtime_hours || 0,
      'Overtime Pay': formatCurrency(record.overtime_pay || 0, currency),
      'Deductions': formatCurrency(record.deductions || 0, currency),
      'Payment Status': record.payment_status || 'Pending',
      'Payment Date': record.payment_date || 'Not set'
    }));
    
    // Create CSV content
    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        headers.map(header => {
          const value = row[header as keyof typeof row];
          // Wrap values in quotes if they contain commas
          return typeof value === 'string' && value.includes(',') ? 
            `"${value}"` : value;
        }).join(',')
      )
    ].join('\n');
    
    // Create download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `payroll_export_${today.toISOString().slice(0, 10)}.csv`);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Notify managers about the export
    const managerIds = await getManagerUserIds();
    await sendNotificationsToMany(managerIds, {
      title: 'Payroll Data Exported',
      message: `Payroll data has been exported for ${payrollData.length} employees.`,
      type: 'info',
      related_entity: 'payroll'
    });
    
    return { 
      success: true, 
      count: payrollData.length 
    };
  } catch (error) {
    console.error('Error exporting payroll data:', error);
    throw error;
  }
};
