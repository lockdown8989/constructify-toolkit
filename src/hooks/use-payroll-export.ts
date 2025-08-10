
import { supabase } from '@/integrations/supabase/client';
import { exportToCSV } from '@/utils/exports/csv-exporter';
import { format } from 'date-fns';

export const exportPayrollData = async (
  currency: string = 'GBP',
  startDate?: Date,
  endDate?: Date
) => {
  try {
    // Determine date filtering
    const currentMonth = format(new Date(), 'yyyy-MM');

    // Base select with all required fields and relation
    let query = supabase
      .from('payroll')
      .select(`
        id,
        employee_id,
        base_pay,
        salary_paid,
        deductions,
        tax_paid,
        ni_contribution,
        other_deductions,
        pension_contribution,
        working_hours,
        overtime_hours,
        overtime_pay,
        payment_status,
        payment_date,
        pay_period,
        payment_method,
        delivery_status,
        delivered_at,
        employees (
          name,
          job_title,
          department,
          site
        )
      `);

    if (startDate && endDate) {
      const start = format(startDate, 'yyyy-MM-dd');
      const end = format(endDate, 'yyyy-MM-dd');
      query = query.gte('payment_date', start).lte('payment_date', end);
    } else {
      // Fallback to current month
      query = query.like('payment_date', `${currentMonth}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error('No payroll data available to export');
    }
    
    // Format data for CSV export
    const formattedData = data.map(record => {
      const employeeData = (record as any).employees as {
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
        'Pension Contribution': `${currency} ${record.pension_contribution?.toFixed(2) || '0.00'}`,
        'Other Deductions': `${currency} ${record.other_deductions?.toFixed(2) || '0.00'}`,
        'Hours Worked': record.working_hours?.toFixed(2) || '0.00',
        'Overtime Hours': record.overtime_hours?.toFixed(2) || '0.00',
        'Overtime Pay': `${currency} ${record.overtime_pay?.toFixed(2) || '0.00'}`,
        'Net Salary': `${currency} ${record.salary_paid?.toFixed(2) || '0.00'}`,
        'Pay Period': record.pay_period || 'Current Period',
        'Payment Method': record.payment_method || 'Bank Transfer',
        'Status': record.payment_status || 'Unknown',
        'Payment Date': record.payment_date ? format(new Date(record.payment_date), 'dd/MM/yyyy') : 'Pending',
        'Delivery Status': record.delivery_status || 'pending',
        'Delivered At': record.delivered_at ? format(new Date(record.delivered_at), 'dd/MM/yyyy HH:mm') : 'Not delivered'
      } as Record<string, any>;
    });
    
    // Generate CSV filename with current date (extension added by exporter)
    const currentDate = format(new Date(), 'yyyy-MM-dd');
    const filename = `payroll_export_${currentDate}`;
    
    await exportToCSV(formattedData, filename);
    
    return { success: true };
  } catch (error) {
    console.error('Error exporting payroll data:', error);
    throw error;
  }
};
