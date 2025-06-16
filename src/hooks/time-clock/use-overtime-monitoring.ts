
import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { calculateRealTimeOvertime } from '@/services/shift-notifications/shift-notification-service';

export const useOvertimeMonitoring = (
  employeeId: string | undefined,
  currentRecord: string | null,
  status: string
) => {
  const { toast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasShownOvertimeWarning = useRef(false);

  useEffect(() => {
    // Only monitor if employee is clocked in
    if (!employeeId || !currentRecord || status !== 'clocked-in') {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      hasShownOvertimeWarning.current = false;
      return;
    }

    // Monitor every minute for overtime
    intervalRef.current = setInterval(async () => {
      try {
        const isOvertime = await calculateRealTimeOvertime(employeeId, currentRecord);
        
        if (isOvertime && !hasShownOvertimeWarning.current) {
          toast({
            title: "⏰ Overtime Started",
            description: "You've exceeded your scheduled shift time. Remember to clock out to minimize overtime.",
            variant: "destructive",
          });
          hasShownOvertimeWarning.current = true;
        }
      } catch (error) {
        console.error('Error monitoring overtime:', error);
      }
    }, 60000); // Check every minute

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [employeeId, currentRecord, status, toast]);

  // Reset warning flag when status changes
  useEffect(() => {
    if (status === 'clocked-out') {
      hasShownOvertimeWarning.current = false;
    }
  }, [status]);
};
