
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

  // Query for live payroll metrics
  const { data: payrollMetrics, isLoading, error, refetch } = useQuery({
    queryKey: ['payroll-sync', timeRange],
    queryFn: async (): Promise<PayrollMetrics> => {
      try {
        setIsProcessing(true);
        
        // Get the actual employee count from the database with better error handling
        const { data: employeeData, error: employeeError } = await supabase
          .from('employees')
          .select('id, status')
          .eq('status', 'Active');

        let actualEmployeeCount = 0;
        if (employeeError) {
          console.error('Error fetching employees:', employeeError);
        } else {
          actualEmployeeCount = employeeData?.length || 0;
        }

        console.log('Live employee count from database:', actualEmployeeCount);
        
        // Get payroll data for calculations
        const { data: payrollData, error: payrollError } = await supabase
          .from('payroll')
          .select('*')
          .order('payment_date', { ascending: false });

        if (payrollError) {
          console.error('Error fetching payroll data:', payrollError);
        }

        const totalPayroll = payrollData?.reduce((sum, record) => sum + (record.salary_paid || 0), 0) || 0;
        const pendingPayslips = payrollData?.filter(record => 
          record.payment_status === 'pending' || record.payment_status === 'processing'
        ).length || 0;

        // Try to call the edge function for advanced processing
        try {
          const { data, error } = await supabase.functions.invoke('process-payroll-data', {
            body: { action: 'sync', timeRange }
          });

          if (error) {
            console.error('Edge function error:', error);
          }

          if (data?.success && data?.data) {
            // Use edge function data but override with our live employee count
            const result = {
              ...data.data,
              totalEmployees: actualEmployeeCount
            };
            console.log('Using edge function data with live employee count:', result);
            return result;
          }
        } catch (edgeError) {
          console.error('Edge function call failed:', edgeError);
        }

        // Fallback: return manual calculations with live data
        const fallbackResult = {
          totalPayroll,
          totalOvertime: 0,
          totalBonuses: 0,
          totalEmployees: actualEmployeeCount,
          paidEmployees: actualEmployeeCount - pendingPayslips,
          pendingEmployees: pendingPayslips,
          absentEmployees: 0,
          chartData: [],
          lastUpdated: new Date().toISOString()
        };

        console.log('Using fallback payroll metrics:', fallbackResult);
        return fallbackResult;
        
      } catch (error) {
        console.error('Error syncing payroll data:', error);
        
        // Final fallback: get at least employee count
        const { data: employeeData } = await supabase
          .from('employees')
          .select('id, status')
          .eq('status', 'Active');

        const actualEmployeeCount = employeeData?.length || 0;
        
        return {
          totalPayroll: 0,
          totalOvertime: 0,
          totalBonuses: 0,
          totalEmployees: actualEmployeeCount,
          paidEmployees: 0,
          pendingEmployees: actualEmployeeCount,
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
      .channel('payroll-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payroll'
        },
        () => {
          // Invalidate and refetch when payroll data changes
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
        () => {
          // Invalidate and refetch when employee data changes
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
        description: "Payroll data has been updated successfully.",
      });
    } catch (error) {
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
