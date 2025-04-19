
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { AttendanceRecord } from '@/types/supabase';
import { useEffect } from 'react';

export type AttendanceData = {
  present: number;
  absent: number;
  late: number;
  total: number;
  recentRecords: AttendanceRecord[];
};

export function useAttendance(employeeId?: string, daysToFetch: number = 30) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('attendance-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance'
        },
        () => {
          // Invalidate and refetch when attendance data changes
          queryClient.invalidateQueries({ queryKey: ['attendance', employeeId, daysToFetch] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [employeeId, daysToFetch, queryClient]);
  
  const fetchAttendanceData = async (): Promise<AttendanceData> => {
    try {
      // Calculate the date range
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
      
      const { data: records = [], error } = await query;
      
      if (error) {
        throw error;
      }
      
      // Process the data
      const present = records.filter(r => r.status === 'Present').length;
      const absent = records.filter(r => r.status === 'Absent').length;
      const late = records.filter(r => r.status === 'Late').length;
      
      // Sort records by date descending to get most recent first
      const sortedRecords = records.sort((a, b) => 
        new Date(b.date || '') < new Date(a.date || '') ? -1 : 1
      );
      
      return {
        present,
        absent,
        late,
        total: records.length,
        recentRecords: sortedRecords.slice(0, 10)
      };
    } catch (err) {
      console.error('Error fetching attendance data:', err);
      toast({
        title: "Failed to fetch attendance data",
        description: err instanceof Error ? err.message : "Unknown error occurred",
        variant: "destructive",
      });
      
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
    refetchOnWindowFocus: true,
  });
}
