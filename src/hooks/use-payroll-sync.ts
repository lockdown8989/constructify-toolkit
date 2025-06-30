
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
        
        // Call our edge function to process data with OpenAI
        const { data, error } = await supabase.functions.invoke('process-payroll-data', {
          body: { action: 'sync', timeRange }
        });

        if (error) throw error;
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to process payroll data');
        }

        return data.data;
      } catch (error) {
        console.error('Error syncing payroll data:', error);
        throw error;
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
