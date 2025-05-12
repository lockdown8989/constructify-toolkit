
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { OpenShiftType } from '@/types/supabase/schedules';

export const useOpenShifts = () => {
  const [openShifts, setOpenShifts] = useState<OpenShiftType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOpenShifts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('open_shifts')
        .select('*')
        .eq('status', 'open')
        .order('start_time', { ascending: true });
          
      if (error) {
        console.error('Error fetching open shifts:', error);
        return;
      }
        
      setOpenShifts(data || []);
    } catch (error) {
      console.error('Error in open shifts fetch:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchOpenShifts();
  }, []);

  return {
    openShifts,
    isLoading,
    refetchOpenShifts: fetchOpenShifts
  };
};
