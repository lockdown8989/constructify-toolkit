
import { LeaveCalendar, AuditLogEntry } from "@/hooks/leave/leave-types";

// Calculate business days (excluding weekends) between two dates
export function calculateLeaveDays(startDateStr: string, endDateStr: string): number {
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  
  let count = 0;
  const currentDate = new Date(startDate);
  
  // Loop through each day between the start and end dates
  while (currentDate <= endDate) {
    // Only count weekdays (0 = Sunday, 6 = Saturday)
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    
    // Move to the next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return count;
}

// Create audit log entry for a leave request
export function createAuditLog(leave: LeaveCalendar, newStatus: string, reviewerName: string): AuditLogEntry[] {
  // If the leave already has an audit log, parse it
  let auditLog = leave.audit_log ? [...leave.audit_log] : [];
  
  // Add a new entry
  auditLog.push({
    timestamp: new Date().toISOString(),
    action: `Status changed from ${leave.status} to ${newStatus}`,
    old_status: leave.status,
    new_status: newStatus,
    status: newStatus,
    reviewer_name: reviewerName,
  });
  
  // Return the updated audit log array
  return auditLog;
}

// Generate a unique ID for leave calendar items
export function generateLeaveId(): string {
  return 'leave_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
}

// Check if two leave periods overlap
export function doLeavePeriodsOverlap(
  start1: string, 
  end1: string, 
  start2: string, 
  end2: string
): boolean {
  const s1 = new Date(start1).getTime();
  const e1 = new Date(end1).getTime();
  const s2 = new Date(start2).getTime();
  const e2 = new Date(end2).getTime();
  
  return (s1 <= e2) && (e1 >= s2);
}
