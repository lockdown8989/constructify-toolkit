
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';

interface DashboardStats {
  activeEmployees: number;
  todaysHours: number;
  overtimeHours: number;
  alerts: number;
}

export const useDashboardStats = () => {
  const { user, isManager, isAdmin, isHR, isPayroll } = useAuth();

  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async (): Promise<DashboardStats> => {
      if (!user) {
        return {
          activeEmployees: 0,
          todaysHours: 0,
          overtimeHours: 0,
          alerts: 0
        };
      }

      const today = new Date().toISOString().split('T')[0];

      try {
        // Get active employees (currently clocked in)
        const { data: activeEmployeesData } = await supabase
          .from('attendance')
          .select('employee_id')
          .eq('date', today)
          .eq('active_session', true)
          .eq('current_status', 'clocked-in');

        // Get today's total hours
        const { data: todaysHoursData } = await supabase
          .from('attendance')
          .select('working_minutes')
          .eq('date', today);

        // Get overtime hours for this week
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekStartStr = weekStart.toISOString().split('T')[0];

        const { data: overtimeData } = await supabase
          .from('attendance')
          .select('overtime_minutes')
          .gte('date', weekStartStr)
          .lte('date', today);

        // Get alerts (attendance issues, late clock-ins, etc.)
        const { data: alertsData } = await supabase
          .from('attendance')
          .select('id')
          .eq('date', today)
          .or('is_late.eq.true,overtime_status.eq.pending,attendance_status.eq.Pending');

        const activeEmployees = activeEmployeesData?.length || 0;
        const todaysHours = todaysHoursData?.reduce((sum, record) => sum + (record.working_minutes || 0), 0) / 60 || 0;
        const overtimeHours = overtimeData?.reduce((sum, record) => sum + (record.overtime_minutes || 0), 0) / 60 || 0;
        const alerts = alertsData?.length || 0;

        console.log('Dashboard stats updated:', { activeEmployees, todaysHours, overtimeHours, alerts });

        return {
          activeEmployees,
          todaysHours: Math.round(todaysHours * 10) / 10,
          overtimeHours: Math.round(overtimeHours * 10) / 10,
          alerts
        };
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return {
          activeEmployees: 0,
          todaysHours: 0,
          overtimeHours: 0,
          alerts: 0
        };
      }
    },
    enabled: !!user,
    refetchInterval: 10000, // Refresh every 10 seconds for more real-time updates
    retry: 2,
    throwOnError: false,
  });

  // Set up real-time subscription for live updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('dashboard-stats-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance'
        },
        (payload) => {
          console.log('Attendance data changed, refreshing stats:', payload);
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refetch]);

  return {
    stats: stats || {
      activeEmployees: 0,
      todaysHours: 0,
      overtimeHours: 0,
      alerts: 0
    },
    isLoading,
    error,
    refetch
  };
};
