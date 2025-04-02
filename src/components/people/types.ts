
import { Employee as DbEmployee } from '@/hooks/use-employees';

export interface Employee {
  id: string;
  avatar: string;
  name: string;
  jobTitle: string;
  department: string;
  site: string;
  siteIcon?: string;
  salary: string;
  startDate: string;
  lifecycle: string;
  status: string;
  statusColor: 'green' | 'gray';
  selected?: boolean;
  managerId?: string;
  userId?: string;
}

export interface PeopleTableProps {
  employees: Employee[];
  onSelectEmployee?: (id: string) => void;
  onUpdateStatus?: (id: string, status: string) => void;
  className?: string;
  isLoading?: boolean;
}

export const mapDbEmployeeToUiEmployee = (dbEmployee: DbEmployee): Employee => {
  return {
    id: dbEmployee.id,
    avatar: dbEmployee.avatar || `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'women' : 'men'}/${Math.floor(Math.random() * 99)}.jpg`,
    name: dbEmployee.name,
    jobTitle: dbEmployee.job_title,
    department: dbEmployee.department,
    site: dbEmployee.site,
    siteIcon: dbEmployee.site.includes('Remote') ? '🌐' : '🏢',
    salary: `$${dbEmployee.salary.toLocaleString()}`,
    startDate: new Date(dbEmployee.start_date).toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }),
    lifecycle: dbEmployee.lifecycle,
    status: dbEmployee.status,
    statusColor: dbEmployee.status === 'Active' ? 'green' : 'gray',
    managerId: dbEmployee.manager_id || undefined,
    userId: dbEmployee.user_id || undefined,
  };
};
