
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { AttendanceRecord } from '@/types/supabase';
import { useEffect } from 'react';
import { format, addDays } from 'date-fns';

export type AttendanceData = {
  present: number;
  absent: number;
  late: number;
  total: number;
  pending: number;
  approved: number;
  recentRecords: AttendanceRecord[];
};

export function useAttendance(employeeId?: string, selectedDate: Date = new Date()) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Set up real-time subscription for attendance changes
  useEffect(() => {
    if (!employeeId) return;
    
    const channel = supabase
      .channel('attendance-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance',
          filter: `employee_id=eq.${employeeId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['attendance', employeeId, format(selectedDate, 'yyyy-MM-dd')] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [employeeId, selectedDate, queryClient]);
  
  const fetchAttendanceData = async (): Promise<AttendanceData> => {
    // If no employeeId provided, return empty data
    if (!employeeId) {
      console.log('No employeeId provided to useAttendance hook');
      return {
        present: 0,
        absent: 0,
        late: 0,
        total: 0,
        pending: 0,
        approved: 0,
        recentRecords: []
      };
    }

    try {
      // For time range queries, use the selectedDate as start date and today as end date
      const startDate = selectedDate;
      const endDate = new Date();
      
      console.log(`Fetching attendance data for employee ${employeeId} from ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}`);
      
      const { data: records = [], error } = await supabase
        .from('attendance')
        .select(`
          *,
          employees:employee_id (
            name
          )
        `)
        .eq('employee_id', employeeId)
        .gte('date', format(startDate, 'yyyy-MM-dd'))
        .lte('date', format(endDate, 'yyyy-MM-dd'));
      
      if (error) {
        throw error;
      }
      
      const processedRecords: AttendanceRecord[] = records.map(record => ({
        ...record,
        employee_name: record.employees?.name,
      }));
      
      const present = processedRecords.filter(r => r.attendance_status === 'Present').length;
      const absent = processedRecords.filter(r => r.attendance_status === 'Absent').length;
      const late = processedRecords.filter(r => r.attendance_status === 'Late').length;
      const pending = processedRecords.filter(r => r.attendance_status === 'Pending').length;
      const approved = processedRecords.filter(r => r.attendance_status === 'Approved').length;
      
      // Sort records by date, most recent first
      const sortedRecords = processedRecords.sort((a, b) => 
        new Date(b.date || '') < new Date(a.date || '') ? -1 : 1
      );
      
      console.log(`Found ${processedRecords.length} attendance records for employee ${employeeId}`);
      
      return {
        present,
        absent,
        late,
        total: processedRecords.length,
        pending,
        approved,
        recentRecords: sortedRecords
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
        pending: 0,
        approved: 0,
        recentRecords: []
      };
    }
  };

  return useQuery({
    queryKey: ['attendance', employeeId, format(selectedDate, 'yyyy-MM-dd')],
    queryFn: fetchAttendanceData,
    enabled: !!employeeId, // Only run query if employeeId exists
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60, // Data becomes stale after 1 minute
  });
}
