
import { EmployeeFormValues } from '../employee-form-schema';

export const validateRequiredFields = (values: EmployeeFormValues): void => {
  if (!values.name?.trim()) {
    throw new Error('Name is required');
  }
  if (!values.job_title?.trim()) {
    throw new Error('Job title is required');
  }
  if (!values.department?.trim()) {
    throw new Error('Department is required');
  }
  if (!values.site?.trim()) {
    throw new Error('Site is required');
  }
  
  // Validate lifecycle value
  const validLifecycles = ['Full time', 'Part time', 'Agency'];
  if (values.lifecycle && !validLifecycles.includes(values.lifecycle)) {
    throw new Error('Invalid employment status selected');
  }
  
  // Validate status value
  const validStatuses = ['Active', 'Inactive', 'Pending'];
  if (values.status && !validStatuses.includes(values.status)) {
    throw new Error('Invalid current status selected');
  }

  // Validate weekly availability data
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  for (const day of days) {
    const availableKey = `${day}_available` as keyof EmployeeFormValues;
    const startTimeKey = `${day}_start_time` as keyof EmployeeFormValues;
    const endTimeKey = `${day}_end_time` as keyof EmployeeFormValues;
    
    const isAvailable = values[availableKey];
    const startTime = values[startTimeKey];
    const endTime = values[endTimeKey];
    
    // If available, ensure start and end times are provided
    if (isAvailable && (!startTime || !endTime)) {
      throw new Error(`${day.charAt(0).toUpperCase() + day.slice(1)} availability requires both start and end times`);
    }
    
    // Validate time format
    if (startTime && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(startTime as string)) {
      throw new Error(`Invalid start time format for ${day}`);
    }
    if (endTime && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(endTime as string)) {
      throw new Error(`Invalid end time format for ${day}`);
    }
  }
};
