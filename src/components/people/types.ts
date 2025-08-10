
import { Employee as DbEmployee } from '@/hooks/use-employees';

export interface Employee {
  id: string;
  name: string;
  jobTitle: string;
  department: string;
  site: string;
  siteIcon: string;
  salary: string;
  startDate: string;
  lifecycle: string;
  status: string;
  statusColor: 'green' | 'gray' | 'blue' | 'amber' | 'yellow';
  avatar?: string;
  managerId?: string;
  userId?: string;
  annual_leave_days?: number;
  sick_leave_days?: number;
  email?: string;
  phone?: string;
  hourly_rate?: number;
  role?: string;
  pin_code?: string;
  employment_type?: string;
  job_description?: string;
  probation_end_date?: string;
}

export interface PeopleTableProps {
  employees: Employee[];
  onSelectEmployee?: (id: string) => void;
  onUpdateStatus?: (id: string, status: string) => void;
  className?: string;
  isLoading?: boolean;
}

export const mapDbEmployeeToUiEmployee = (dbEmployee: any): Employee => {
  const siteIcon = dbEmployee.location === 'Remote' ? '🌐' : '🏢';
  const statusColor = dbEmployee.status === 'Active'
    ? 'green'
    : dbEmployee.status === 'Inactive'
    ? 'gray'
    : dbEmployee.status === 'Invited'
    ? 'blue'
    : dbEmployee.status === 'Absent'
    ? 'amber'
    : dbEmployee.status === 'On Leave'
    ? 'yellow'
    : 'gray';
  
  // Format salary with British pound symbol
  const formattedSalary = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(dbEmployee.salary || 0);
  
  // Format date in readable format
  const formattedDate = dbEmployee.start_date ? 
    new Date(dbEmployee.start_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  
  return {
    id: dbEmployee.id,
    name: dbEmployee.name || '',
    jobTitle: dbEmployee.job_title || '',
    department: dbEmployee.department || '',
    site: dbEmployee.site || '',
    siteIcon,
    salary: formattedSalary,
    startDate: formattedDate,
    lifecycle: dbEmployee.lifecycle || 'Active',
    status: dbEmployee.status || 'Active',
    statusColor,
    avatar: dbEmployee.avatar_url,
    managerId: dbEmployee.manager_id,
    userId: dbEmployee.user_id,
    annual_leave_days: dbEmployee.annual_leave_days,
    sick_leave_days: dbEmployee.sick_leave_days,
    email: dbEmployee.email,
    phone: dbEmployee.phone,
    hourly_rate: dbEmployee.hourly_rate,
    role: dbEmployee.role,
    pin_code: dbEmployee.pin_code,
    employment_type: dbEmployee.employment_type,
    job_description: dbEmployee.job_description,
    probation_end_date: dbEmployee.probation_end_date,
  };
};
