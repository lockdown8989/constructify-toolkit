
import { differenceInCalendarDays, format } from "date-fns";
import type { LeaveCalendar } from "@/hooks/leave/leave-types";

// Calculate the number of days between leave start and end date
export const calculateLeaveDays = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return differenceInCalendarDays(end, start) + 1;
};

// Create an audit log entry for leave approval/rejection
export const createAuditLog = (leave: LeaveCalendar, action: "Approved" | "Rejected", userName: string): string => {
  const currentDate = new Date().toISOString();
  const existingNotes = leave.notes || "";
  const formattedDate = format(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'');
  const auditEntry = `${action} by ${userName} on ${formattedDate}`;
  
  return existingNotes
    ? `${existingNotes}\n\n${auditEntry}`
    : auditEntry;
};
