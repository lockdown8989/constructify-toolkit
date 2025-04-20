
export interface EmployeeDocument {
  name: string;
  type: 'contract' | 'payslip';
  size: string;
  path?: string;
  url?: string;
}
