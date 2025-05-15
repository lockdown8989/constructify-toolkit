
export interface Employee {
  id: string;
  name: string;
  avatar?: string;
  title: string;  // Required in this interface
  salary: string | number;
  status: 'Paid' | 'Absent' | 'Pending' | string;
  selected?: boolean;
  paymentDate?: string;
  department?: string;
  job_title?: string; // Added for compatibility with the main Employee type
  site?: string; // Added for compatibility with the main Employee type
}

export interface SalaryTableProps {
  employees: Employee[];
  onSelectEmployee?: (id: string) => void;
  onUpdateStatus?: (id: string, status: 'Paid' | 'Absent' | 'Pending') => void;
  className?: string;
}
