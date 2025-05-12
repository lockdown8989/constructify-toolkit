
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { AttendanceRecord } from '@/types/supabase';
import { useEffect } from 'react';
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';

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
          queryClient.invalidateQueries({ queryKey: ['attendance', employeeId, format(selectedDate, 'yyyy-MM-dd')] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [employeeId, selectedDate, queryClient]);
  
  const fetchAttendanceData = async (): Promise<AttendanceData> => {
    try {
      // For time range queries, use the selectedDate as end date
      const endDate = new Date();
      const startDate = selectedDate;
      
      console.log(`Fetching attendance data from ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}`);
      
      const query = supabase
        .from('attendance')
        .select(`
          *,
          employees:employee_id (
            name
          )
        `)
        .gte('date', format(startDate, 'yyyy-MM-dd'))
        .lte('date', format(endDate, 'yyyy-MM-dd'));
      
      if (employeeId) {
        query.eq('employee_id', employeeId);
      }
      
      const { data: records = [], error } = await query;
      
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
      
      const sortedRecords = processedRecords.sort((a, b) => 
        new Date(b.date || '') < new Date(a.date || '') ? -1 : 1
      );
      
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
    refetchOnWindowFocus: true,
  });
}
