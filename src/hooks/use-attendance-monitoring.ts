import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAttendanceMonitoring = () => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const runAttendanceMonitoring = async () => {
      try {
        console.log('🔍 Running attendance monitoring...');
        
        // Call our edge function to handle all monitoring tasks
        const { data, error } = await supabase.functions.invoke('attendance-monitor');
        
        if (error) {
          console.error('❌ Error in attendance monitoring:', error);
        } else {
          console.log('✅ Attendance monitoring completed:', data);
        }
      } catch (error) {
        console.error('💥 Failed to run attendance monitoring:', error);
      }
    };

    // Run immediately on load
    runAttendanceMonitoring();

    // Set up recurring monitoring every 5 minutes
    intervalRef.current = setInterval(runAttendanceMonitoring, 5 * 60 * 1000);

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  return {
    triggerManualCheck: async () => {
      try {
        const { data, error } = await supabase.functions.invoke('attendance-monitor');
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error in manual attendance check:', error);
        throw error;
      }
    }
  };
};