import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { startOfWeek, endOfWeek, formatISO } from 'date-fns';

interface LaborStats {
  scheduledHours: number;
  overtimeHours: number;
  laborCost: number;
}

const LaborHoursCard: React.FC = () => {
  const [stats, setStats] = useState<LaborStats>({
    scheduledHours: 0,
    overtimeHours: 0,
    laborCost: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLaborStats = async () => {
      setLoading(true);
      try {
        const now = new Date();
        const weekStart = formatISO(startOfWeek(now), { representation: 'date' });
        const weekEnd = formatISO(endOfWeek(now), { representation: 'date' });

        console.log('Fetching labor stats for week:', weekStart, 'to', weekEnd);

        // Fetch all schedules for this week (both published and unpublished for accurate calculation)
        const { data: schedules, error: schedulesError } = await supabase
          .from('schedules')
          .select('start_time, end_time, hourly_rate, break_duration, estimated_cost, employee_id, employees(hourly_rate)')
          .gte('start_time', weekStart)
          .lte('start_time', weekEnd);

        if (schedulesError) {
          console.error('Error fetching schedules:', schedulesError);
          throw schedulesError;
        }

        console.log('Found schedules:', schedules?.length || 0);

        // Calculate total hours and costs
        let totalScheduledHours = 0;
        let totalCost = 0;

        if (schedules && schedules.length > 0) {
          schedules.forEach(schedule => {
            const startTime = new Date(schedule.start_time);
            const endTime = new Date(schedule.end_time);
            const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
            const breakHours = (schedule.break_duration || 30) / 60; // Default 30 min break
            const workingHours = Math.max(0, hours - breakHours);
            
            totalScheduledHours += workingHours;
            
            // Calculate cost using hourly rate from schedule or employee  
            const hourlyRate = schedule.hourly_rate || 15; // Default £15/hour
            const shiftCost = workingHours * hourlyRate;
            totalCost += schedule.estimated_cost || shiftCost;
          });
        }

        // Fetch overtime data for the week
        const { data: attendance, error: attendanceError } = await supabase
          .from('attendance')
          .select('overtime_minutes')
          .gte('date', weekStart)
          .lte('date', weekEnd)
          .not('overtime_minutes', 'is', null);

        if (attendanceError) {
          console.error('Error fetching attendance:', attendanceError);
        }

        const totalOvertimeHours = attendance?.reduce((sum, record) => {
          return sum + ((record.overtime_minutes || 0) / 60);
        }, 0) || 0;

        console.log('Labor stats calculated:', {
          scheduledHours: totalScheduledHours,
          overtimeHours: totalOvertimeHours,
          laborCost: totalCost
        });

        setStats({
          scheduledHours: Math.round(totalScheduledHours),
          overtimeHours: Math.round(totalOvertimeHours),
          laborCost: Math.round(totalCost)
        });
      } catch (error) {
        console.error('Error fetching labor stats:', error);
        // Show actual zero values instead of placeholder data
        setStats({
          scheduledHours: 0,
          overtimeHours: 0,
          laborCost: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLaborStats();
    
    // Set up interval to refresh data every 30 seconds
    const interval = setInterval(fetchLaborStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Labor Hours
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Scheduled</span>
              <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Overtime</span>
              <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-sm font-medium">Labor Cost</span>
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Scheduled</span>
              <span className="font-medium">{stats.scheduledHours}h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Overtime</span>
              <span className="font-medium text-orange-600">{stats.overtimeHours}h</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-sm font-medium">Labor Cost</span>
              <span className="font-bold">£{stats.laborCost.toLocaleString()}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LaborHoursCard;