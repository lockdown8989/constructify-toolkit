
import { 
  format, 
  isSameMonth,
  isToday,
  getDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isWithinInterval
} from "date-fns";
import type { LeaveCalendar } from "@/hooks/use-leave-calendar";

/**
 * Generates a calendar grid for the given month
 */
export function generateCalendarGrid(currentDate: Date): (Date | null)[][] {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Find the day of the week the month starts on (0 = Sunday, 1 = Monday, etc.)
  const startDay = getDay(monthStart);
  
  // Create a grid for the calendar
  const calendarGrid: (Date | null)[] = [];
  
  // Add empty cells for days before the month starts
  for (let i = 0; i < startDay; i++) {
    calendarGrid.push(null);
  }
  
  // Add all days of the month
  monthDays.forEach(day => {
    calendarGrid.push(day);
  });
  
  // Add empty cells to complete the grid
  while (calendarGrid.length % 7 !== 0) {
    calendarGrid.push(null);
  }
  
  // Group days into weeks
  const calendarWeeks: (Date | null)[][] = [];
  for (let i = 0; i < calendarGrid.length; i += 7) {
    calendarWeeks.push(calendarGrid.slice(i, i + 7));
  }
  
  return calendarWeeks;
}

/**
 * Get leaves for a specific day
 */
export function getLeavesForDay(day: Date | null, leaves: LeaveCalendar[]): LeaveCalendar[] {
  if (!day) return [];
  
  return leaves.filter(leave => {
    const startDate = new Date(leave.start_date);
    const endDate = new Date(leave.end_date);
    
    // Check if the day falls within the leave period
    return day >= startDate && day <= endDate;
  });
}

/**
 * Get meetings for a specific day
 */
export interface Meeting {
  id: string;
  title: string;
  time: string;
  participants: string[];
}

export function getMeetingsForDay(day: Date | null, meetings: Meeting[] = []): Meeting[] {
  if (!day) return [];
  
  return meetings.filter(meeting => {
    const [meetingDate] = meeting.time.split(" "); // Format: "YYYY-MM-DD HH:MM"
    return meetingDate === format(day, "yyyy-MM-dd");
  });
}
