
export interface Employee {
  id: string;
  name: string;
  avatar?: string;  // Make sure avatar is optional here as well
  title: string;
  salary: string | number;
  status: 'Paid' | 'Absent' | 'Pending';
  selected?: boolean;
  paymentDate?: string;
  department?: string;
  job_title?: string;
  site?: string;
}

export interface SalaryTableProps {
  employees: Employee[];
  onSelectEmployee?: (id: string) => void;
  onUpdateStatus?: (id: string, status: 'Paid' | 'Absent' | 'Pending') => void;
  className?: string;
}
