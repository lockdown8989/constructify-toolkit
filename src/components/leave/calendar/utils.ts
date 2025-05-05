
import { startOfMonth, endOfMonth, startOfWeek, addDays, addWeeks, isSameDay, isWithinInterval } from "date-fns";
import type { LeaveCalendar } from "@/hooks/leave/leave-types";

export function generateCalendarGrid(currentDate: Date): (Date | null)[][] {
  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);
  
  // Find the first day of the week of the month
  // We use 1 as weekStartsOn to start the week on Monday
  const startDay = startOfWeek(firstDayOfMonth, { weekStartsOn: 1 });
  
  const weeks: (Date | null)[][] = [];
  let week: (Date | null)[] = [];
  
  // Create a grid for 6 weeks max
  for (let i = 0; i < 42; i++) {
    const day = addDays(startDay, i);
    
    // Add to current week
    week.push(day);
    
    // If weekend or last day, start a new week
    if (week.length === 7) {
      weeks.push(week);
      week = [];
      
      // If we're past the end of the month and completed a week, stop
      if (day > lastDayOfMonth && i % 7 === 6) break;
    }
  }
  
  return weeks;
}

export function getLeavesForDay(day: Date, leaves: LeaveCalendar[]): LeaveCalendar[] {
  return leaves.filter(leave => {
    const startDate = new Date(leave.start_date);
    const endDate = new Date(leave.end_date);
    
    return isWithinInterval(day, { start: startDate, end: endDate });
  });
}

export interface Meeting {
  id: string;
  title: string;
  start: Date;
  end: Date;
}

export function getMeetingsForDay(day: Date | null, meetings: Meeting[]): Meeting[] {
  if (!day) return [];
  
  return meetings.filter(meeting => {
    return isSameDay(day, meeting.start) || 
           isSameDay(day, meeting.end) || 
           (day > meeting.start && day < meeting.end);
  });
}

export function getTypeColor(type: string): string {
  switch (type?.toLowerCase()) {
    case 'holiday':
      return 'bg-blue-500';
    case 'sickness':
      return 'bg-red-500';
    case 'personal':
      return 'bg-purple-500';
    case 'parental':
      return 'bg-green-500';
    default:
      return 'bg-gray-500'; // Other
  }
}

export function getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case 'approved':
      return 'bg-green-600';
    case 'pending':
      return 'bg-amber-600';
    case 'rejected':
      return 'bg-red-600';
    default:
      return 'bg-gray-600';
  }
}
