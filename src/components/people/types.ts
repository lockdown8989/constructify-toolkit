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
  statusColor: 'green' | 'gray';
  avatar?: string;
  managerId?: string;
  userId?: string;
  annual_leave_days?: number;
  sick_leave_days?: number;
  email?: string;
  phone?: string;
  hourly_rate?: number;
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
  const statusColor = dbEmployee.status === 'Active' ? 'green' : 'gray';
  
  // Format salary with appropriate currency symbol
  const formattedSalary = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(dbEmployee.salary);
  
  // Format date in readable format
  const formattedDate = new Date(dbEmployee.start_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return {
    id: dbEmployee.id,
    name: dbEmployee.name,
    jobTitle: dbEmployee.job_title,
    department: dbEmployee.department,
    site: dbEmployee.site,
    siteIcon,
    salary: formattedSalary,
    startDate: formattedDate,
    lifecycle: dbEmployee.lifecycle,
    status: dbEmployee.status,
    statusColor,
    avatar: dbEmployee.avatar,
    managerId: dbEmployee.manager_id,
    userId: dbEmployee.user_id,
    annual_leave_days: dbEmployee.annual_leave_days,
    sick_leave_days: dbEmployee.sick_leave_days,
    email: dbEmployee.email,
    phone: dbEmployee.phone,
    hourly_rate: dbEmployee.hourly_rate
  };
};
