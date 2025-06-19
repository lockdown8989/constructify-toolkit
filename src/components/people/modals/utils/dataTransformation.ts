
import { EmployeeFormValues } from '../employee-form-schema';
import { sanitizeString, sanitizeNumber, sanitizeUuid, ensureBoolean, ensureTimeString } from './dataSanitization';

export const transformEmployeeData = (values: EmployeeFormValues) => {
  console.log('🔄 Transforming employee data with weekly availability:', {
    saturday_available: values.saturday_available,
    sunday_available: values.sunday_available,
    saturday_start_time: values.saturday_start_time,
    saturday_end_time: values.saturday_end_time,
    sunday_start_time: values.sunday_start_time,
    sunday_end_time: values.sunday_end_time
  });

  return {
    name: values.name.trim(),
    email: sanitizeString(values.email),
    job_title: values.job_title.trim(),
    department: values.department.trim(),
    site: values.site.trim(),
    location: sanitizeString(values.location),
    salary: sanitizeNumber(values.salary),
    hourly_rate: sanitizeNumber(values.hourly_rate),
    start_date: values.start_date || new Date().toISOString().split('T')[0],
    status: values.status || 'Active',
    lifecycle: values.lifecycle || 'Full time',
    role: 'employee',
    // Properly sanitize UUID fields to prevent "invalid input syntax for type uuid" errors
    shift_pattern_id: sanitizeUuid(values.shift_pattern_id),
    monday_shift_id: sanitizeUuid(values.monday_shift_id),
    tuesday_shift_id: sanitizeUuid(values.tuesday_shift_id),
    wednesday_shift_id: sanitizeUuid(values.wednesday_shift_id),
    thursday_shift_id: sanitizeUuid(values.thursday_shift_id),
    friday_shift_id: sanitizeUuid(values.friday_shift_id),
    saturday_shift_id: sanitizeUuid(values.saturday_shift_id),
    sunday_shift_id: sanitizeUuid(values.sunday_shift_id),
    // Weekly availability with explicit boolean conversion and proper logging
    monday_available: ensureBoolean(values.monday_available),
    monday_start_time: values.monday_available ? ensureTimeString(values.monday_start_time) : '09:00',
    monday_end_time: values.monday_available ? ensureTimeString(values.monday_end_time) : '17:00',
    tuesday_available: ensureBoolean(values.tuesday_available),
    tuesday_start_time: values.tuesday_available ? ensureTimeString(values.tuesday_start_time) : '09:00',
    tuesday_end_time: values.tuesday_available ? ensureTimeString(values.tuesday_end_time) : '17:00',
    wednesday_available: ensureBoolean(values.wednesday_available),
    wednesday_start_time: values.wednesday_available ? ensureTimeString(values.wednesday_start_time) : '09:00',
    wednesday_end_time: values.wednesday_available ? ensureTimeString(values.wednesday_end_time) : '17:00',
    thursday_available: ensureBoolean(values.thursday_available),
    thursday_start_time: values.thursday_available ? ensureTimeString(values.thursday_start_time) : '09:00',
    thursday_end_time: values.thursday_available ? ensureTimeString(values.thursday_end_time) : '17:00',
    friday_available: ensureBoolean(values.friday_available),
    friday_start_time: values.friday_available ? ensureTimeString(values.friday_start_time) : '09:00',
    friday_end_time: values.friday_available ? ensureTimeString(values.friday_end_time) : '17:00',
    saturday_available: ensureBoolean(values.saturday_available),
    saturday_start_time: values.saturday_available ? ensureTimeString(values.saturday_start_time) : '09:00',
    saturday_end_time: values.saturday_available ? ensureTimeString(values.saturday_end_time) : '17:00',
    sunday_available: ensureBoolean(values.sunday_available),
    sunday_start_time: values.sunday_available ? ensureTimeString(values.sunday_start_time) : '09:00',
    sunday_end_time: values.sunday_available ? ensureTimeString(values.sunday_end_time) : '17:00',
  };
};
