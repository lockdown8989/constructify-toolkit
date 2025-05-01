
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/utils/format';

/**
 * Export payroll data to CSV
 */
export const exportPayrollData = async (currency: string = 'GBP'): Promise<void> => {
  try {
    // Fetch payroll data joined with employee data
    const { data, error } = await supabase
      .from('payroll')
      .select('*, employees(name, job_title, department)')
      .order('payment_date', { ascending: false });
      
    if (error) throw error;
    if (!data || data.length === 0) throw new Error('No payroll data available to export');
    
    // Format data for CSV
    const csvData = data.map(record => {
      const employee = record.employees as { name: string, job_title: string, department: string } | null;
      
      return {
        "Employee Name": employee?.name || 'Unknown',
        "Job Title": employee?.job_title || 'Unknown',
        "Department": employee?.department || 'Unknown',
        "Base Pay": formatCurrency(record.base_pay, currency),
        "Working Hours": record.working_hours,
        "Overtime Hours": record.overtime_hours,
        "Overtime Pay": formatCurrency(record.overtime_pay, currency),
        "Deductions": formatCurrency(record.deductions, currency),
        "Bonus": formatCurrency(record.bonus || 0, currency),
        "Net Salary": formatCurrency(record.salary_paid, currency),
        "Payment Date": record.payment_date,
        "Status": record.payment_status
      };
    });
    
    // Convert to CSV string
    const headers = Object.keys(csvData[0]);
    const csvString = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => {
        const value = row[header as keyof typeof row];
        // Escape commas and quotes in values
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(','))
    ].join('\n');
    
    // Create and download CSV file
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const date = new Date().toISOString().split('T')[0];
    const filename = `payroll_export_${date}.csv`;
    
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    return;
  } catch (error) {
    console.error('Error exporting payroll data:', error);
    throw error;
  }
};
