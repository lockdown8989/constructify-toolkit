
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subMonths } from 'date-fns';
import { PayrollRecord, PayrollHistoryRecord } from '@/types/supabase/payroll';

export const usePayrollProcessingHistory = () => {
  return useQuery({
    queryKey: ['payroll-processing-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payroll_history')
        .select(`
          id, 
          employee_count, 
          success_count, 
          fail_count, 
          processed_by, 
          processing_date,
          employee_ids,
          profiles:processed_by(first_name, last_name)
        `)
        .order('processing_date', { ascending: false })
        .limit(50);
        
      if (error) throw error;
      return data as PayrollHistoryRecord[];
    }
  });
};

export const usePaymentHistory = (timeRange: string = 'last3months') => {
  // Get date range based on selection
  const getDateRange = () => {
    const now = new Date();
    
    switch (timeRange) {
      case 'current':
        return format(now, 'yyyy-MM');
      case 'previous':
        return format(new Date(now.getFullYear(), now.getMonth() - 1), 'yyyy-MM');
      case 'last3months':
        return format(new Date(now.getFullYear(), now.getMonth() - 3), 'yyyy-MM');
      case 'last6months':
        return format(new Date(now.getFullYear(), now.getMonth() - 6), 'yyyy-MM');
      case 'lastyear':
        return format(new Date(now.getFullYear() - 1, now.getMonth()), 'yyyy-MM');
      default:
        return format(new Date(now.getFullYear(), now.getMonth() - 3), 'yyyy-MM');
    }
  };
  
  const fromDate = getDateRange();
  
  return useQuery({
    queryKey: ['payment-history', timeRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payroll')
        .select(`
          id,
          employee_id,
          base_pay,
          salary_paid,
          deductions,
          payment_status,
          payment_date,
          delivery_status,
          delivered_at,
          document_url,
          employees (
            name,
            job_title,
            department
          )
        `)
        .gte('payment_date', `${fromDate}-01`)
        .order('payment_date', { ascending: false });
        
      if (error) throw error;
      return data as PayrollRecord[];
    }
  });
};

export const usePreviousMonthPayslips = () => {
  // Get previous month's date range
  const prevMonthDate = subMonths(new Date(), 1);
  const prevMonth = format(prevMonthDate, 'yyyy-MM');
  
  return useQuery({
    queryKey: ['previous-month-payslips', prevMonth],
    queryFn: async () => {
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
          other_deductions,
          pension_contribution,
          payment_status,
          payment_date,
          pay_period,
          employees (
            name,
            job_title,
            department
          )
        `)
        .like('payment_date', `${prevMonth}%`)
        .order('payment_date', { ascending: false });
        
      if (error) throw error;
      return data as PayrollRecord[];
    }
  });
};
