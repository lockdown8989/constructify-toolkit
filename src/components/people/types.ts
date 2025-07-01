
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
  role?: string;
  shift_pattern_id?: string;
  monday_shift_id?: string;
  tuesday_shift_id?: string;
  wednesday_shift_id?: string;
  thursday_shift_id?: string;
  friday_shift_id?: string;
  saturday_shift_id?: string;
  sunday_shift_id?: string;
  
  // Weekly availability fields
  monday_available?: boolean;
  monday_start_time?: string;
  monday_end_time?: string;
  tuesday_available?: boolean;
  tuesday_start_time?: string;
  tuesday_end_time?: string;
  wednesday_available?: boolean;
  wednesday_start_time?: string;
  wednesday_end_time?: string;
  thursday_available?: boolean;
  thursday_start_time?: string;
  thursday_end_time?: string;
  friday_available?: boolean;
  friday_start_time?: string;
  friday_end_time?: string;
  saturday_available?: boolean;
  saturday_start_time?: string;
  saturday_end_time?: string;
  sunday_available?: boolean;
  sunday_start_time?: string;
  sunday_end_time?: string;
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
  
  // Format salary with British pound symbol
  const formattedSalary = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
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
    hourly_rate: dbEmployee.hourly_rate,
    role: dbEmployee.role,
    shift_pattern_id: dbEmployee.shift_pattern_id,
    monday_shift_id: dbEmployee.monday_shift_id,
    tuesday_shift_id: dbEmployee.tuesday_shift_id,
    wednesday_shift_id: dbEmployee.wednesday_shift_id,
    thursday_shift_id: dbEmployee.thursday_shift_id,
    friday_shift_id: dbEmployee.friday_shift_id,
    saturday_shift_id: dbEmployee.saturday_shift_id,
    sunday_shift_id: dbEmployee.sunday_shift_id,
    
    // Weekly availability fields
    monday_available: dbEmployee.monday_available,
    monday_start_time: dbEmployee.monday_start_time,
    monday_end_time: dbEmployee.monday_end_time,
    tuesday_available: dbEmployee.tuesday_available,
    tuesday_start_time: dbEmployee.tuesday_start_time,
    tuesday_end_time: dbEmployee.tuesday_end_time,
    wednesday_available: dbEmployee.wednesday_available,
    wednesday_start_time: dbEmployee.wednesday_start_time,
    wednesday_end_time: dbEmployee.wednesday_end_time,
    thursday_available: dbEmployee.thursday_available,
    thursday_start_time: dbEmployee.thursday_start_time,
    thursday_end_time: dbEmployee.thursday_end_time,
    friday_available: dbEmployee.friday_available,
    friday_start_time: dbEmployee.friday_start_time,
    friday_end_time: dbEmployee.friday_end_time,
    saturday_available: dbEmployee.saturday_available,
    saturday_start_time: dbEmployee.saturday_start_time,
    saturday_end_time: dbEmployee.saturday_end_time,
    sunday_available: dbEmployee.sunday_available,
    sunday_start_time: dbEmployee.sunday_start_time,
    sunday_end_time: dbEmployee.sunday_end_time,
  };
};
