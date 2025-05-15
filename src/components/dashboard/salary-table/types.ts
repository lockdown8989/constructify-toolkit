
export interface Employee {
  id: string;
  name: string;
  title: string;
  salary: string | number;
  status: 'Paid' | 'Absent' | 'Pending';
  paymentDate: string;
  department?: string;
  avatar?: string;  // Make sure avatar is optional here as well
  site?: string;    // Add site property
  selected?: boolean;
  user_id?: string;
}

export interface SalaryTableProps {
  employees: Employee[];
  onSelectEmployee?: (id: string) => void;
  onUpdateStatus?: (id: string, status: 'Paid' | 'Absent' | 'Pending') => void;
  className?: string;
}
