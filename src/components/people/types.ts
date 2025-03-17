
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
}

export interface PeopleTableProps {
  employees: Employee[];
  onSelectEmployee?: (id: string) => void;
  className?: string;
  isLoading?: boolean;
}
