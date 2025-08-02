import { useEffect } from 'react';
import { runRotaComplianceCheck, RotaComplianceReport } from '@/services/rota-compliance/rota-enforcement';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to manage rota pattern compliance checking
 */
export const useRotaCompliance = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query to get compliance status
  const { data: complianceReport, isLoading, error, refetch } = useQuery({
    queryKey: ['rota-compliance'],
    queryFn: runRotaComplianceCheck,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });

  // Manual compliance check function
  const runComplianceCheck = async () => {
    try {
      toast({
        title: "Running Compliance Check",
        description: "Checking rota pattern compliance for all employees...",
      });

      const report = await runRotaComplianceCheck();
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['rota-compliance'] });

      if (report.incompleteSchedules > 0) {
        toast({
          title: "Compliance Issues Found",
          description: `Found ${report.incompleteSchedules} incomplete rota compliance records. Managers have been notified.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Compliance Check Complete",
          description: "All employees are in compliance with their rota patterns.",
        });
      }

      return report;
    } catch (error) {
      console.error('Failed to run compliance check:', error);
      toast({
        title: "Compliance Check Failed",
        description: "Unable to complete rota compliance check. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Set up periodic compliance checking (every hour during business hours)
  useEffect(() => {
    const scheduleComplianceCheck = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
      
      // Only run during business hours (8 AM - 8 PM) on weekdays
      if (currentDay >= 1 && currentDay <= 5 && currentHour >= 8 && currentHour <= 20) {
        console.log('Scheduling automatic rota compliance check...');
        
        // Schedule check every hour
        const interval = setInterval(() => {
          const checkTime = new Date();
          const checkHour = checkTime.getHours();
          const checkDay = checkTime.getDay();
          
          if (checkDay >= 1 && checkDay <= 5 && checkHour >= 8 && checkHour <= 20) {
            console.log('Running automatic rota compliance check...');
            runRotaComplianceCheck().catch(console.error);
          }
        }, 60 * 60 * 1000); // 1 hour
        
        return () => clearInterval(interval);
      }
    };

    scheduleComplianceCheck();
  }, []);

  return {
    complianceReport,
    isLoading,
    error,
    runComplianceCheck,
    refetch
  };
};