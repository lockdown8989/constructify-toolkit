
import { 
  format, 
  isSameMonth,
  isToday,
  getDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval
} from "date-fns";
import type { LeaveCalendar } from "@/hooks/use-leave-calendar";

/**
 * Returns the background color class for a leave type
 */
export const getTypeColor = (type: string): string => {
  switch (type) {
    case "Holiday":
      return "bg-blue-500";
    case "Sickness":
      return "bg-red-500";
    case "Personal":
      return "bg-purple-500";
    case "Parental":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
};

/**
 * Returns the background color class for a leave status
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case "Approved":
      return "bg-green-500";
    case "Rejected":
      return "bg-red-500";
    default:
      return "bg-yellow-500";
  }
};

/**
 * Generates a calendar grid for the given month
 */
export const generateCalendarGrid = (currentDate: Date) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Find the day of the week the month starts on (0 = Sunday, 1 = Monday, etc.)
  const startDay = getDay(monthStart);
  
  // Create a grid for the calendar
  const calendarGrid = [];
  
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
  const calendarWeeks = [];
  for (let i = 0; i < calendarGrid.length; i += 7) {
    calendarWeeks.push(calendarGrid.slice(i, i + 7));
  }
  
  return calendarWeeks;
};

/**
 * Get leaves for a specific day
 */
export const getLeavesForDay = (day: Date, leaves: LeaveCalendar[]): LeaveCalendar[] => {
  if (!day) return [];
  
  const dayString = format(day, "yyyy-MM-dd");
  
  return leaves.filter(leave => {
    const startDate = new Date(leave.start_date);
    const endDate = new Date(leave.end_date);
    
    // Check if the day falls within the leave period
    return (
      dayString >= format(startDate, "yyyy-MM-dd") && 
      dayString <= format(endDate, "yyyy-MM-dd")
    );
  });
};
