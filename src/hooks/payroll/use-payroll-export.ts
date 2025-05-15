
import { supabase } from '@/integrations/supabase/client';
import { exportToCSV } from '@/utils/exports';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export const exportPayrollData = async (currency: string = 'GBP') => {
  try {
    // Get payroll data for the current month
    const currentMonth = format(new Date(), 'yyyy-MM');
    const { data, error } = await supabase
      .from('payroll')
      .select(`
        id,
        employee_id,
        base_pay,
        salary_paid,
        deductions,
        tax_paid,
        ni_contribution,
        working_hours,
        overtime_hours,
        overtime_pay,
        payment_status,
        payment_date,
        employees (
          name,
          job_title,
          department,
          site
        )
      `)
      .like('payment_date', `${currentMonth}%`);
      
    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error('No payroll data available to export');
    }
    
    // Format data for CSV export
    const formattedData = data.map(record => {
      // Safely access the nested employee data with proper type assertions
      const employeeData = record.employees as {
        name?: string;
        job_title?: string;
        department?: string;
        site?: string;
      } || {};
      
      return {
        'Employee Name': employeeData.name || 'Unknown',
        'Job Title': employeeData.job_title || 'Unknown',
        'Department': employeeData.department || 'Unknown',
        'Site': employeeData.site || 'Unknown',
        'Base Salary': `${currency} ${record.base_pay?.toFixed(2) || '0.00'}`,
        'Deductions': `${currency} ${record.deductions?.toFixed(2) || '0.00'}`,
        'Tax Paid': `${currency} ${record.tax_paid?.toFixed(2) || '0.00'}`,
        'NI Contribution': `${currency} ${record.ni_contribution?.toFixed(2) || '0.00'}`,
        'Hours Worked': record.working_hours?.toFixed(2) || '0.00',
        'Overtime Hours': record.overtime_hours?.toFixed(2) || '0.00',
        'Overtime Pay': `${currency} ${record.overtime_pay?.toFixed(2) || '0.00'}`,
        'Net Salary': `${currency} ${record.salary_paid?.toFixed(2) || '0.00'}`,
        'Status': record.payment_status || 'Unknown',
        'Payment Date': record.payment_date ? format(new Date(record.payment_date), 'dd/MM/yyyy') : 'Pending'
      };
    });
    
    // Generate CSV filename with current date
    const currentDate = format(new Date(), 'yyyy-MM-dd');
    const filename = `payroll_export_${currentDate}.csv`;
    
    // Export to CSV
    await exportToCSV(formattedData, filename);
    
    return { success: true };
  } catch (error) {
    console.error('Error exporting payroll data:', error);
    throw error;
  }
};
