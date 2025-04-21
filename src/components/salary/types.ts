
export interface EmployeeDocument {
  name: string;
  type: 'contract' | 'payslip';
  size: string;
  path?: string;
  url?: string;
  employeeId?: string; // Add this property to fix the TypeScript error
}
