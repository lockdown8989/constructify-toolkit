
import { supabase } from '@/integrations/supabase/client';
import { ConflictBucket, ConflictViolation, HeatmapData, ConflictRule } from '@/types/conflict-heatmap';
import { addMinutes, format, isWithinInterval, differenceInMinutes, startOfWeek, endOfWeek } from 'date-fns';

export class ConflictEngine {
  private readonly BUCKET_SIZE_MINUTES = 30;
  private readonly conflictRules: ConflictRule[] = [
    {
      id: 'double_booking',
      name: 'Double Booking',
      type: 'hard',
      weight: 100,
      threshold: 80,
      description: 'Employee scheduled for overlapping shifts'
    },
    {
      id: 'min_rest_hours',
      name: 'Minimum Rest Period',
      type: 'hard',
      weight: 90,
      threshold: 70,
      description: 'Less than 10 hours rest between shifts'
    },
    {
      id: 'max_weekly_hours',
      name: 'Maximum Weekly Hours',
      type: 'hard',
      weight: 85,
      threshold: 75,
      description: 'Exceeds maximum weekly working hours'
    },
    {
      id: 'overtime_risk',
      name: 'Overtime Risk',
      type: 'soft',
      weight: 60,
      threshold: 50,
      description: 'Approaching overtime threshold'
    },
    {
      id: 'skill_mismatch',
      name: 'Skill Mismatch',
      type: 'soft',
      weight: 40,
      threshold: 30,
      description: 'Employee lacks required skills for role'
    },
    {
      id: 'preference_mismatch',
      name: 'Preference Mismatch',
      type: 'soft',
      weight: 30,
      threshold: 25,
      description: 'Shift conflicts with employee availability preferences'
    }
  ];

  async calculateConflicts(weekStart: Date, weekEnd: Date): Promise<HeatmapData> {
    console.log('Calculating conflicts for week:', format(weekStart, 'yyyy-MM-dd'), 'to', format(weekEnd, 'yyyy-MM-dd'));
    
    // Fetch all schedules for the week
    const { data: schedules, error: schedulesError } = await supabase
      .from('schedules')
      .select(`
        id,
        employee_id,
        start_time,
        end_time,
        title,
        notes,
        status,
        employees (
          id,
          name,
          job_title,
          department
        )
      `)
      .gte('start_time', weekStart.toISOString())
      .lte('end_time', weekEnd.toISOString())
      .eq('published', true);

    if (schedulesError) {
      console.error('Error fetching schedules:', schedulesError);
      throw schedulesError;
    }

    // Fetch employee availability
    const { data: availabilityData, error: availabilityError } = await supabase
      .from('availability_requests')
      .select('*')
      .gte('date', format(weekStart, 'yyyy-MM-dd'))
      .lte('date', format(weekEnd, 'yyyy-MM-dd'));

    if (availabilityError) {
      console.error('Error fetching availability:', availabilityError);
    }

    // Create time buckets for the week
    const buckets: Record<string, Record<string, ConflictBucket>> = {};
    const employees = [...new Set(schedules?.map(s => s.employee_id).filter(Boolean))];

    // Initialize buckets for each employee
    employees.forEach(employeeId => {
      buckets[employeeId] = {};
      let currentTime = new Date(weekStart);
      
      while (currentTime <= weekEnd) {
        const bucketKey = format(currentTime, "yyyy-MM-dd'T'HH:mm");
        buckets[employeeId][bucketKey] = {
          score: 0,
          violations: []
        };
        currentTime = addMinutes(currentTime, this.BUCKET_SIZE_MINUTES);
      }
    });

    // Calculate conflicts for each schedule
    schedules?.forEach(schedule => {
      if (!schedule.employee_id) return;

      const startTime = new Date(schedule.start_time);
      const endTime = new Date(schedule.end_time);
      const violations = this.detectViolations(schedule, schedules || [], availabilityData || []);

      // Apply violations to relevant time buckets
      let currentBucket = new Date(startTime);
      while (currentBucket < endTime) {
        const bucketKey = format(currentBucket, "yyyy-MM-dd'T'HH:mm");
        
        if (buckets[schedule.employee_id][bucketKey]) {
          buckets[schedule.employee_id][bucketKey].shift_id = schedule.id;
          buckets[schedule.employee_id][bucketKey].violations.push(...violations);
          buckets[schedule.employee_id][bucketKey].score = Math.max(
            buckets[schedule.employee_id][bucketKey].score,
            violations.reduce((max, v) => Math.max(max, this.getViolationScore(v)), 0)
          );
        }
        
        currentBucket = addMinutes(currentBucket, this.BUCKET_SIZE_MINUTES);
      }
    });

    return {
      buckets,
      meta: {
        maxScore: 100,
        weekStart: format(weekStart, 'yyyy-MM-dd'),
        weekEnd: format(weekEnd, 'yyyy-MM-dd')
      }
    };
  }

  private detectViolations(
    currentSchedule: any,
    allSchedules: any[],
    availabilityData: any[]
  ): ConflictViolation[] {
    const violations: ConflictViolation[] = [];
    const startTime = new Date(currentSchedule.start_time);
    const endTime = new Date(currentSchedule.end_time);

    // Check for double booking
    const overlappingShifts = allSchedules.filter(s => 
      s.employee_id === currentSchedule.employee_id &&
      s.id !== currentSchedule.id &&
      this.isOverlapping(
        new Date(s.start_time),
        new Date(s.end_time),
        startTime,
        endTime
      )
    );

    if (overlappingShifts.length > 0) {
      violations.push({
        type: 'hard',
        rule: 'double_booking',
        description: `Overlaps with ${overlappingShifts.length} other shift(s)`,
        severity: 'critical'
      });
    }

    // Check minimum rest between shifts
    const employeeShifts = allSchedules
      .filter(s => s.employee_id === currentSchedule.employee_id && s.id !== currentSchedule.id)
      .map(s => ({ start: new Date(s.start_time), end: new Date(s.end_time) }))
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    employeeShifts.forEach(shift => {
      const restTime = Math.abs(differenceInMinutes(shift.end, startTime));
      if (restTime < 600) { // Less than 10 hours (600 minutes)
        violations.push({
          type: 'hard',
          rule: 'min_rest_hours',
          description: `Only ${Math.floor(restTime / 60)} hours rest before this shift`,
          severity: 'high'
        });
      }
    });

    // Check weekly hours limit
    const weekStart = startOfWeek(startTime, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(startTime, { weekStartsOn: 1 });
    const weeklyShifts = allSchedules.filter(s => 
      s.employee_id === currentSchedule.employee_id &&
      isWithinInterval(new Date(s.start_time), { start: weekStart, end: weekEnd })
    );

    const totalWeeklyMinutes = weeklyShifts.reduce((total, shift) => 
      total + differenceInMinutes(new Date(shift.end_time), new Date(shift.start_time)), 0
    );

    if (totalWeeklyMinutes > 2400) { // More than 40 hours (2400 minutes)
      violations.push({
        type: 'hard',
        rule: 'max_weekly_hours',
        description: `Total weekly hours: ${Math.floor(totalWeeklyMinutes / 60)} hours`,
        severity: 'high'
      });
    }

    // Check overtime risk (approaching 8 hours daily)
    const shiftDuration = differenceInMinutes(endTime, startTime);
    if (shiftDuration > 420) { // More than 7 hours (420 minutes)
      violations.push({
        type: 'soft',
        rule: 'overtime_risk',
        description: `Shift duration: ${Math.floor(shiftDuration / 60)} hours`,
        severity: 'medium'
      });
    }

    // Check availability preferences
    const dayAvailability = availabilityData.find(a => 
      a.employee_id === currentSchedule.employee_id &&
      format(new Date(a.date), 'yyyy-MM-dd') === format(startTime, 'yyyy-MM-dd')
    );

    if (dayAvailability && !dayAvailability.is_available) {
      violations.push({
        type: 'soft',
        rule: 'preference_mismatch',
        description: 'Employee marked as unavailable for this day',
        severity: 'medium'
      });
    }

    return violations;
  }

  private isOverlapping(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
    return start1 < end2 && start2 < end1;
  }

  private getViolationScore(violation: ConflictViolation): number {
    const rule = this.conflictRules.find(r => r.id === violation.rule);
    return rule ? rule.weight : 0;
  }

  getConflictRules(): ConflictRule[] {
    return this.conflictRules;
  }

  validateShift(employeeId: string, startTime: Date, endTime: Date): ConflictViolation[] {
    // This would be used for real-time validation during shift creation/editing
    return [];
  }
}

export const conflictEngine = new ConflictEngine();
