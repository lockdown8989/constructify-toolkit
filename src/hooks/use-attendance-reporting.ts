import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AttendanceReportData {
  totalRecords: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  pendingCount: number;
  overtimeMinutes: number;
  employeeBreakdown: Array<{
    employeeId: string;
    employeeName: string;
    department: string;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    totalOvertimeMinutes: number;
  }>;
}

export function useAttendanceReporting(timeRange: 'day' | 'week' | 'month' = 'month') {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['attendance-reporting', timeRange],
    queryFn: async (): Promise<AttendanceReportData> => {
      try {
        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        
        if (timeRange === 'day') {
          startDate.setDate(startDate.getDate() - 1);
        } else if (timeRange === 'week') {
          startDate.setDate(startDate.getDate() - 7);
        } else {
          startDate.setMonth(startDate.getMonth() - 1);
        }

        console.log(`Fetching attendance report for ${timeRange}: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);

        // Fetch attendance data with employee information
        const { data: attendanceData, error } = await supabase
          .from('attendance')
          .select(`
            id,
            employee_id,
            date,
            attendance_status,
            overtime_minutes,
            working_minutes,
            is_late,
            employees!attendance_employee_id_fkey (
              id,
              name,
              department,
              status,
              job_title
            )
          `)
          .gte('date', startDate.toISOString().split('T')[0])
          .lte('date', endDate.toISOString().split('T')[0])
          .not('employees.status', 'eq', 'Deleted')
          .order('date', { ascending: false });

        if (error) {
          console.error('Attendance reporting error:', error);
          throw new Error(`Failed to fetch attendance data: ${error.message}`);
        }

        console.log(`Fetched ${attendanceData?.length || 0} attendance records`);

        // Process the data
        const records = attendanceData || [];
        
        // Calculate summary statistics
        const totalRecords = records.length;
        const presentCount = records.filter(r => r.attendance_status === 'Present').length;
        const absentCount = records.filter(r => r.attendance_status === 'Absent').length;
        const lateCount = records.filter(r => r.is_late === true).length;
        const pendingCount = records.filter(r => r.attendance_status === 'Pending').length;
        const overtimeMinutes = records.reduce((sum, r) => sum + (r.overtime_minutes || 0), 0);

        // Create employee breakdown
        const employeeMap = new Map<string, {
          employeeId: string;
          employeeName: string;
          department: string;
          presentDays: number;
          absentDays: number;
          lateDays: number;
          totalOvertimeMinutes: number;
        }>();

        records.forEach(record => {
          if (!record.employees || !record.employee_id) return;

          const empId = record.employee_id;
          const employee = Array.isArray(record.employees) ? record.employees[0] : record.employees;
          
          if (!employeeMap.has(empId)) {
            employeeMap.set(empId, {
              employeeId: empId,
              employeeName: employee?.name || 'Unknown',
              department: employee?.department || 'Unknown',
              presentDays: 0,
              absentDays: 0,
              lateDays: 0,
              totalOvertimeMinutes: 0
            });
          }

          const empData = employeeMap.get(empId)!;
          
          if (record.attendance_status === 'Present') empData.presentDays++;
          if (record.attendance_status === 'Absent') empData.absentDays++;
          if (record.is_late) empData.lateDays++;
          empData.totalOvertimeMinutes += record.overtime_minutes || 0;
        });

        const employeeBreakdown = Array.from(employeeMap.values());

        const reportData: AttendanceReportData = {
          totalRecords,
          presentCount,
          absentCount,
          lateCount,
          pendingCount,
          overtimeMinutes,
          employeeBreakdown
        };

        console.log('Processed attendance report data:', reportData);
        return reportData;

      } catch (error) {
        console.error('Error in attendance reporting:', error);
        toast({
          title: "Failed to generate attendance report",
          description: error instanceof Error ? error.message : "Unknown error occurred",
          variant: "destructive",
        });
        
        // Return empty data on error
        return {
          totalRecords: 0,
          presentCount: 0,
          absentCount: 0,
          lateCount: 0,
          pendingCount: 0,
          overtimeMinutes: 0,
          employeeBreakdown: []
        };
      }
    },
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
    refetchInterval: 60000, // Refetch every minute for live updates
    refetchOnWindowFocus: true,
  });
}