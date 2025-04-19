import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { AttendanceRecord } from '@/types/supabase';

export type AttendanceData = {
  present: number;
  absent: number;
  late: number;
  total: number;
  recentRecords: AttendanceRecord[];
};

export function useAttendance(employeeId?: string, daysToFetch: number = 30) {
  const { toast } = useToast();
  
  const fetchAttendanceData = async (): Promise<AttendanceData> => {
    try {
      // Calculate the date range (last X days)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysToFetch);
      
      // Query to fetch attendance records
      const query = supabase
        .from('attendance')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0]);
      
      // Filter by employee if provided
      if (employeeId) {
        query.eq('employee_id', employeeId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      // Process the data
      const records = data as AttendanceRecord[];
      const present = records.filter(r => r.status === 'Present').length;
      const absent = records.filter(r => r.status === 'Absent').length;
      const late = records.filter(r => r.status === 'Late').length;
      
      return {
        present,
        absent,
        late,
        total: records.length,
        recentRecords: records.slice(0, 10) // Get the 10 most recent records
      };
    } catch (err) {
      console.error('Error fetching attendance data:', err);
      toast({
        title: "Failed to fetch attendance data",
        description: err instanceof Error ? err.message : "Unknown error occurred",
        variant: "destructive",
      });
      
      // Return default data if fetch fails
      return {
        present: 0,
        absent: 0,
        late: 0,
        total: 0,
        recentRecords: []
      };
    }
  };

  return useQuery({
    queryKey: ['attendance', employeeId, daysToFetch],
    queryFn: fetchAttendanceData,
  });
}
