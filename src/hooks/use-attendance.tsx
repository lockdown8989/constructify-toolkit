
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { AttendanceRecord } from '@/types/supabase';
import { useEffect } from 'react';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export type AttendanceData = {
  present: number;
  absent: number;
  late: number;
  total: number;
  recentRecords: AttendanceRecord[];
};

export function useAttendance(employeeId?: string, selectedDate: Date = new Date()) {
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
          queryClient.invalidateQueries({ queryKey: ['attendance', employeeId, format(selectedDate, 'yyyy-MM')] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [employeeId, selectedDate, queryClient]);
  
  const fetchAttendanceData = async (): Promise<AttendanceData> => {
    try {
      // Calculate the date range for the selected month
      const start = startOfMonth(selectedDate);
      const end = endOfMonth(selectedDate);
      
      // Query to fetch attendance records with employee names
      const query = supabase
        .from('attendance')
        .select(`
          *,
          employees:employee_id (
            name
          )
        `)
        .gte('date', format(start, 'yyyy-MM-dd'))
        .lte('date', format(end, 'yyyy-MM-dd'));
      
      // Filter by employee if provided
      if (employeeId) {
        query.eq('employee_id', employeeId);
      }
      
      const { data: records = [], error } = await query;
      
      if (error) {
        throw error;
      }
      
      // Process the data and map employee names
      const processedRecords: AttendanceRecord[] = records.map(record => ({
        id: record.id,
        employee_id: record.employee_id,
        date: record.date,
        check_in: record.check_in,
        check_out: record.check_out,
        status: record.status,
        employee_name: record.employees?.name,
        working_minutes: record.working_minutes,
        overtime_minutes: record.overtime_minutes,
        overtime_status: record.overtime_status,
        overtime_approved_at: record.overtime_approved_at,
        overtime_approved_by: record.overtime_approved_by,
        break_minutes: record.break_minutes,
        break_start: record.break_start,
        location: record.location,
        device_info: record.device_info,
        notes: record.notes
      }));
      
      const present = processedRecords.filter(r => r.status === 'Present').length;
      const absent = processedRecords.filter(r => r.status === 'Absent').length;
      const late = processedRecords.filter(r => r.status === 'Late').length;
      
      // Sort records by date descending
      const sortedRecords = processedRecords.sort((a, b) => 
        new Date(b.date || '') < new Date(a.date || '') ? -1 : 1
      );
      
      return {
        present,
        absent,
        late,
        total: processedRecords.length,
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
        recentRecords: []
      };
    }
  };

  return useQuery({
    queryKey: ['attendance', employeeId, format(selectedDate, 'yyyy-MM')],
    queryFn: fetchAttendanceData,
    refetchOnWindowFocus: true,
  });
}
