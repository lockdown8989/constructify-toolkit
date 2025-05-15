
import { EmployeeSchedule } from "@/hooks/use-employee-schedule";
import { Schedule } from "@/hooks/use-schedules";
import { ScheduleStatus } from "@/types/supabase/schedules";

/**
 * Converts an EmployeeSchedule to a Schedule
 */
export const convertEmployeeScheduleToSchedule = (employeeSchedule: EmployeeSchedule): Schedule => {
  // Cast the status to the expected type
  let scheduleStatus: "confirmed" | "pending" | "completed" | "rejected" = "pending";
  
  // Map the employee schedule status to a valid Schedule status
  switch (employeeSchedule.status) {
    case "confirmed":
    case "pending":
    case "completed":
    case "rejected":
      scheduleStatus = employeeSchedule.status as "confirmed" | "pending" | "completed" | "rejected";
      break;
    default:
      // For any other status, default to pending
      scheduleStatus = "pending";
  }
  
  return {
    ...employeeSchedule,
    mobile_notification_sent: employeeSchedule.mobile_notification_sent || false,
    created_platform: employeeSchedule.created_platform || "web",
    last_modified_platform: employeeSchedule.last_modified_platform || "web",
    status: scheduleStatus,
  };
};

/**
 * Converts an array of EmployeeSchedule to an array of Schedule
 */
export const convertEmployeeSchedulesToSchedules = (employeeSchedules: EmployeeSchedule[]): Schedule[] => {
  return employeeSchedules.map(convertEmployeeScheduleToSchedule);
};
