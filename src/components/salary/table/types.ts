
export interface Employee {
  id: string;
  name: string;
  avatar?: string;
  title: string;
  salary: string | number;
  status: 'Paid' | 'Absent' | 'Pending';
  selected?: boolean;
  paymentDate?: string;
  department?: string;
  job_title?: string;
  hourly_rate?: number;
}

export interface SalaryTableProps {
  employees: Employee[];
  onSelectEmployee?: (id: string) => void;
  onUpdateStatus?: (id: string, status: 'Paid' | 'Absent' | 'Pending') => void;
  className?: string;
}
