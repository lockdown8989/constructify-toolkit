
export interface Employee {
  id: string;
  name: string;
  title: string;
  salary: string | number;
  status: 'Paid' | 'Absent' | 'Pending';
  paymentDate: string;
  department?: string;
  avatar?: string;
  selected?: boolean;
  user_id?: string; // Add this field to fix the error
}

export interface SalaryTableProps {
  employees: Employee[];
  onSelectEmployee?: (id: string) => void;
  onUpdateStatus?: (id: string, status: 'Paid' | 'Absent' | 'Pending') => void;
  className?: string;
}
