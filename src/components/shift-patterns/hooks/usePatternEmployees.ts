
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ShiftPattern } from '@/types/shift-patterns';

export const usePatternEmployees = (shiftPatterns: ShiftPattern[]) => {
  const [patternEmployees, setPatternEmployees] = useState<Record<string, any[]>>({});

  useEffect(() => {
    const fetchPatternEmployees = async () => {
      if (shiftPatterns.length === 0) return;
      
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
            console.error('Error fetching pattern employees:', error);
            continue;
          }

          // Get unique employees for this pattern
          const uniqueEmployees = schedules?.reduce((acc: any[], schedule: any) => {
            const employee = schedule.employees;
            if (employee && !acc.find(emp => emp.id === employee.id)) {
              acc.push(employee);
            }
            return acc;
          }, []) || [];

          patternEmployeeMap[pattern.id] = uniqueEmployees;
        } catch (error) {
          console.error('Error fetching employees for pattern:', pattern.id, error);
          patternEmployeeMap[pattern.id] = [];
        }
      }
      
      setPatternEmployees(patternEmployeeMap);
    };

    fetchPatternEmployees();
  }, [shiftPatterns]);

  return patternEmployees;
};
