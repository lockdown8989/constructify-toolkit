
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEmployees } from '@/hooks/use-employees';
import { format } from 'date-fns';
import { AttendanceForm } from './AttendanceForm';
import { AttendanceTable } from './AttendanceTable';

interface AttendanceRecord {
  id: string;
  employee_id: string;
  check_in: string;
  check_out: string | null;
  status: string;
}

export function AttendanceTracker() {
  const { data: employees = [] } = useEmployees();
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const { data: attendanceRecords = [] } = useQuery({
    queryKey: ['attendance', today],
    queryFn: async () => {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .gte('check_in', startOfDay.toISOString());
        
      if (error) throw error;
      return data as AttendanceRecord[];
    }
  });
  
  return (
    <div className="space-y-6">
      <AttendanceForm employees={employees} />
      <AttendanceTable 
        attendanceRecords={attendanceRecords} 
        employees={employees}
      />
    </div>
  );
}
