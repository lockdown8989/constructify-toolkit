
export interface EmployeeDocument {
  name: string;
  type: 'contract' | 'resume' | 'payslip';
  size: string;
  path?: string;
  url?: string;
}
