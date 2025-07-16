
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ShiftTemplate } from '@/types/schedule';

export const usePatternEmployees = (shiftPatterns: ShiftTemplate[]) => {
  const [patternEmployees, setPatternEmployees] = useState<Record<string, any[]>>({});
  const queryClient = useQueryClient();

  const fetchPatternEmployees = async () => {
    if (shiftPatterns.length === 0) return;
    
    console.log('Fetching pattern employees for patterns:', shiftPatterns.map(p => p.id));
    
    const patternEmployeeMap: Record<string, any[]> = {};
    
    for (const pattern of shiftPatterns) {
      try {
        // Get employees assigned to this pattern via the new assignments table
        const { data: assignments, error } = await supabase
          .from('shift_template_assignments')
          .select(`
            employee_id,
            employees!inner(id, name, job_title)
          `)
          .eq('shift_template_id', pattern.id)
          .eq('is_active', true);

        if (error) {
          console.error('Error fetching pattern employees for pattern', pattern.id, ':', error);
          patternEmployeeMap[pattern.id] = [];
          continue;
        }

        console.log('Raw assignments data for pattern', pattern.id, ':', assignments);

        // Extract unique employees for this pattern
        const uniqueEmployees = assignments?.map(assignment => assignment.employees).filter(Boolean) || [];

        console.log('Unique employees for pattern', pattern.id, ':', uniqueEmployees);
        patternEmployeeMap[pattern.id] = uniqueEmployees;
      } catch (error) {
        console.error('Error fetching employees for pattern:', pattern.id, error);
        patternEmployeeMap[pattern.id] = [];
      }
    }
    
    console.log('Final pattern employee map:', patternEmployeeMap);
    setPatternEmployees(patternEmployeeMap);
  };

  useEffect(() => {
    fetchPatternEmployees();
  }, [shiftPatterns]);

  // Listen for changes in shift pattern assignments
  useEffect(() => {
    const invalidateAndRefetch = () => {
      console.log('Shift pattern assignments changed, refetching pattern employees');
      fetchPatternEmployees();
    };

    // Listen for query invalidation
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.query.queryKey[0] === 'shift_template_assignments' || event.query.queryKey[0] === 'schedules') {
        invalidateAndRefetch();
      }
    });

    return unsubscribe;
  }, [queryClient, shiftPatterns]);

  // Set up real-time subscription for shift pattern assignments
  useEffect(() => {
    const channel = supabase
      .channel('shift_template_assignments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',  // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'shift_template_assignments'
        },
        (payload) => {
          console.log('Real-time shift pattern assignment change:', payload);
          fetchPatternEmployees();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [shiftPatterns]);

  // Manual refresh function
  const refreshPatternEmployees = () => {
    console.log('Manual refresh of pattern employees');
    fetchPatternEmployees();
  };

  return { patternEmployees, refreshPatternEmployees };
};
