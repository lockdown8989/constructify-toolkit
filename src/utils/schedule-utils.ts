
import { EmployeeSchedule } from "@/hooks/use-employee-schedule";
import { Schedule } from "@/hooks/use-schedules";

/**
 * Converts an EmployeeSchedule to a Schedule
 */
export const convertEmployeeScheduleToSchedule = (employeeSchedule: EmployeeSchedule): Schedule => {
  return {
    ...employeeSchedule,
    mobile_notification_sent: employeeSchedule.mobile_notification_sent || false,
    created_platform: employeeSchedule.created_platform || "web",
    last_modified_platform: employeeSchedule.last_modified_platform || "web",
    status: employeeSchedule.status as any,
  };
};

/**
 * Converts an array of EmployeeSchedule to an array of Schedule
 */
export const convertEmployeeSchedulesToSchedules = (employeeSchedules: EmployeeSchedule[]): Schedule[] => {
  return employeeSchedules.map(convertEmployeeScheduleToSchedule);
};
