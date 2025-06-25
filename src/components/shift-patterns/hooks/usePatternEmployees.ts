
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ShiftPattern } from '@/types/shift-patterns';

export const usePatternEmployees = (shiftPatterns: ShiftPattern[]) => {
  const [patternEmployees, setPatternEmployees] = useState<Record<string, any[]>>({});
  const queryClient = useQueryClient();

  const fetchPatternEmployees = async () => {
    if (shiftPatterns.length === 0) return;
    
    console.log('Fetching pattern employees for patterns:', shiftPatterns.map(p => p.id));
    
    const patternEmployeeMap: Record<string, any[]> = {};
    
    for (const pattern of shiftPatterns) {
      try {
        // Get employees assigned to this pattern via recurring schedules
        const { data: schedules, error } = await supabase
          .from('schedules')
          .select(`
            employee_id,
            employees!inner(id, name, job_title)
          `)
          .eq('template_id', pattern.id)
          .eq('recurring', true)
          .eq('shift_type', 'pattern');

        if (error) {
          console.error('Error fetching pattern employees for pattern', pattern.id, ':', error);
          patternEmployeeMap[pattern.id] = [];
          continue;
        }

        console.log('Raw schedules data for pattern', pattern.id, ':', schedules);

        // Get unique employees for this pattern
        const uniqueEmployees = schedules?.reduce((acc: any[], schedule: any) => {
          const employee = schedule.employees;
          if (employee && !acc.find(emp => emp.id === employee.id)) {
            acc.push(employee);
          }
          return acc;
        }, []) || [];

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

  // Listen for schedule changes to refetch data
  useEffect(() => {
    const invalidateAndRefetch = () => {
      console.log('Schedules data changed, refetching pattern employees');
      fetchPatternEmployees();
    };

    // Listen for query invalidation
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.query.queryKey[0] === 'schedules') {
        invalidateAndRefetch();
      }
    });

    return unsubscribe;
  }, [queryClient, shiftPatterns]);

  // Manual refresh function
  const refreshPatternEmployees = () => {
    console.log('Manual refresh of pattern employees');
    fetchPatternEmployees();
  };

  return { patternEmployees, refreshPatternEmployees };
};
