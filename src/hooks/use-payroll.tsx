
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePayrollProcessing } from './payroll/use-payroll-processing';
import { Employee } from '@/types/employee';
import { PayrollRecord } from '@/types/supabase/payroll';
import { notifyEmployeeAboutPayslip } from '@/services/notifications/payroll-notifications';

export const usePayroll = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { processPayroll } = usePayrollProcessing();
  
  const fetchPayroll = async (period?: string) => {
    const currentPeriod = period || new Date().toISOString().split('T')[0].substring(0, 7); // YYYY-MM format
    
    try {
      const { data, error } = await supabase
        .from('payroll_history')
        .select('*')
        .ilike('pay_period', `${currentPeriod}%`)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as PayrollRecord[];
    } catch (error) {
      console.error('Error fetching payroll data:', error);
      return [];
    }
  };
  
  const usePayrollData = (period?: string) => {
    return useQuery({
      queryKey: ['payroll', period],
      queryFn: () => fetchPayroll(period),
    });
  };
  
  const useProcessPayroll = () => {
    return useMutation({
      mutationFn: async (employees: Employee[]) => {
        try {
          const processedRecords = await processPayroll(employees);
          
          // Send notifications to employees about their payslips
          for (const record of processedRecords) {
            try {
              // Find the employee with user_id to send notification to
              const { data: employeeData } = await supabase
                .from('employees')
                .select('user_id')
                .eq('id', record.employee_id)
                .single();
                
              if (employeeData?.user_id) {
                await notifyEmployeeAboutPayslip(
                  record.employee_id,
                  employeeData.user_id,
                  record.net_pay || record.salary_paid,
                  'GBP',
                  record.payment_date
                );
              }
            } catch (notifyError) {
              console.error(`Error notifying employee ${record.employee_id}:`, notifyError);
              // Continue processing other employees even if notification fails for one
            }
          }
          
          return processedRecords;
        } catch (error) {
          console.error("Process payroll mutation error:", error);
          throw error;
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['payroll'] });
        toast({
          title: "Success",
          description: "Payroll successfully processed and employees notified"
        });
      },
      onError: (error) => {
        console.error("Payroll processing error:", error);
        toast({
          title: "Error",
          description: "Failed to process payroll",
          variant: "destructive"
        });
      }
    });
  };
  
  const useUpdatePayrollStatus = () => {
    return useMutation({
      mutationFn: async ({ id, status }: { id: string, status: 'Pending' | 'Paid' | 'Cancelled' }) => {
        const { error } = await supabase
          .from('payroll_history')
          .update({ status, processed_at: status === 'Paid' ? new Date().toISOString() : null })
          .eq('id', id);
          
        if (error) throw error;
        return { id, status };
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['payroll'] });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: "Failed to update payroll status",
          variant: "destructive"
        });
        console.error("Payroll status update error:", error);
      }
    });
  };
  
  return {
    usePayrollData,
    useProcessPayroll,
    useUpdatePayrollStatus
  };
};

export default usePayroll;
