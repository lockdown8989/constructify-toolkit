
export interface Employee {
  id: string;
  name: string;
  avatar?: string;  // Changed from required to optional with ?
  title: string;
  salary: string;
  hourly_rate?: number;  // Added hourly rate field
  status: 'Paid' | 'Absent' | 'Pending';
  selected?: boolean;
  paymentDate?: string;
  department?: string;
}

export interface SalaryTableProps {
  employees: Employee[];
  onSelectEmployee?: (id: string) => void;
  onUpdateStatus?: (id: string, status: 'Paid' | 'Absent' | 'Pending') => void;
  className?: string;
}
