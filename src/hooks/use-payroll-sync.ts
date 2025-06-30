
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';

interface PayrollMetrics {
  totalPayroll: number;
  totalOvertime: number;
  totalBonuses: number;
  totalEmployees: number;
  paidEmployees: number;
  pendingEmployees: number;
  absentEmployees: number;
  analysis?: any;
  chartData: any[];
  lastUpdated: string;
}

export const usePayrollSync = (timeRange: 'day' | 'week' | 'month' = 'month') => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for live payroll metrics with enhanced employee data fetching
  const { data: payrollMetrics, isLoading, error, refetch } = useQuery({
    queryKey: ['payroll-sync', timeRange],
    queryFn: async (): Promise<PayrollMetrics> => {
      try {
        setIsProcessing(true);
        
        console.log('Starting payroll sync for timeRange:', timeRange);
        
        // First, get all employees from the database (not just active ones for payroll purposes)
        const { data: employeeData, error: employeeError } = await supabase
          .from('employees')
          .select('id, name, status, salary, user_id, job_title, department')
          .in('status', ['Active', 'Inactive', 'Pending']); // Include all relevant statuses

        if (employeeError) {
          console.error('Error fetching employees:', employeeError);
          throw employeeError;
        }

        const actualEmployeeCount = employeeData?.length || 0;
        console.log('Live employee count from database:', actualEmployeeCount);
        console.log('Employee data:', employeeData);
        
        // Get payroll data for calculations
        const { data: payrollData, error: payrollError } = await supabase
          .from('payroll')
          .select('*')
          .order('payment_date', { ascending: false });

        if (payrollError) {
          console.error('Error fetching payroll data:', payrollError);
        }

        // Calculate payroll metrics
        const totalPayroll = payrollData?.reduce((sum, record) => sum + (record.salary_paid || 0), 0) || 0;
        const pendingPayslips = payrollData?.filter(record => 
          record.payment_status === 'pending' || record.payment_status === 'processing'
        ).length || 0;

        // Calculate paid employees (those with successful payroll records)
        const paidEmployeeIds = new Set(
          payrollData?.filter(record => record.payment_status === 'paid')
            .map(record => record.employee_id) || []
        );
        const paidEmployeesCount = Math.min(paidEmployeeIds.size, actualEmployeeCount);

        // Try to call the edge function for advanced processing
        let edgeFunctionData = null;
        try {
          const { data, error } = await supabase.functions.invoke('process-payroll-data', {
            body: { action: 'sync', timeRange }
          });

          if (error) {
            console.error('Edge function error:', error);
          } else if (data?.success && data?.data) {
            edgeFunctionData = data.data;
            console.log('Edge function returned data:', edgeFunctionData);
          }
        } catch (edgeError) {
          console.error('Edge function call failed:', edgeError);
        }

        // Prepare the final result with live employee count
        const result = {
          totalPayroll,
          totalOvertime: edgeFunctionData?.totalOvertime || 0,
          totalBonuses: edgeFunctionData?.totalBonuses || 0,
          totalEmployees: actualEmployeeCount, // Always use live count
          paidEmployees: paidEmployeesCount,
          pendingEmployees: pendingPayslips,
          absentEmployees: Math.max(0, actualEmployeeCount - paidEmployeesCount - pendingPayslips),
          analysis: edgeFunctionData?.analysis || {
            averageSalary: actualEmployeeCount > 0 ? totalPayroll / actualEmployeeCount : 0,
            insights: `Payroll data shows ${actualEmployeeCount} employees with total payroll of $${totalPayroll.toFixed(2)}`
          },
          chartData: edgeFunctionData?.chartData || [],
          lastUpdated: new Date().toISOString()
        };

        console.log('Final payroll metrics:', result);
        return result;
        
      } catch (error) {
        console.error('Error syncing payroll data:', error);
        
        // Fallback: get at least employee count
        const { data: fallbackEmployeeData } = await supabase
          .from('employees')
          .select('id, status')
          .in('status', ['Active', 'Inactive', 'Pending']);

        const fallbackEmployeeCount = fallbackEmployeeData?.length || 0;
        console.log('Fallback employee count:', fallbackEmployeeCount);
        
        return {
          totalPayroll: 0,
          totalOvertime: 0,
          totalBonuses: 0,
          totalEmployees: fallbackEmployeeCount,
          paidEmployees: 0,
          pendingEmployees: fallbackEmployeeCount,
          absentEmployees: 0,
          chartData: [],
          lastUpdated: new Date().toISOString()
        };
      } finally {
        setIsProcessing(false);
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds for live updates
    staleTime: 0, // Always refetch
  });

  // Set up real-time subscriptions for live updates
  useEffect(() => {
    const channel = supabase
      .channel('payroll-employee-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payroll'
        },
        (payload) => {
          console.log('Payroll table changed:', payload);
          queryClient.invalidateQueries({ queryKey: ['payroll-sync'] });
          queryClient.invalidateQueries({ queryKey: ['live-employee-count'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'employees'
        },
        (payload) => {
          console.log('Employees table changed:', payload);
          queryClient.invalidateQueries({ queryKey: ['payroll-sync'] });
          queryClient.invalidateQueries({ queryKey: ['live-employee-count'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Manual sync function
  const manualSync = async () => {
    try {
      setIsProcessing(true);
      await refetch();
      // Also refetch the live employee count
      queryClient.invalidateQueries({ queryKey: ['live-employee-count'] });
      toast({
        title: "Data Synchronized",
        description: "Payroll and employee data has been updated successfully.",
      });
    } catch (error) {
      console.error('Manual sync error:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to synchronize payroll data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    payrollMetrics: payrollMetrics || {
      totalPayroll: 0,
      totalOvertime: 0,
      totalBonuses: 0,
      totalEmployees: 0,
      paidEmployees: 0,
      pendingEmployees: 0,
      absentEmployees: 0,
      chartData: [],
      lastUpdated: new Date().toISOString()
    },
    isLoading,
    isProcessing,
    error,
    manualSync,
    refetch
  };
};
