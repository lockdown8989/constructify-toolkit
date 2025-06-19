
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
};
