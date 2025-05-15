
export interface PayslipData {
  id: string;
  employeeId: string;
  employeeName: string;
  name?: string; // For backward compatibility
  department: string;
  position: string;
  payPeriod: string;
  period: string;
  grossPay: number;
  taxes: number;
  netPay: number;
  paymentDate: string;
  baseSalary: number;
  deductions: number;
  currency: string;
  bankAccount: string;
  title: string;
  salary: string | number;
  overtimePay: number;
  bonus: number;
  totalPay: number;
  notes?: string;
}

export interface Employee {
  id: string;
  name: string;
  avatar?: string;
  title?: string;
  job_title?: string;
  salary: string | number;
  status?: string;
  paymentDate?: string;
  department?: string;
  site?: string;
  position?: string;
}

export interface PayrollRecord {
  id: string;
  employee_id: string;
  employee_name?: string; // Added for compatibility
  employeeName?: string; // Added for compatibility
  payment_date: string;
  payment_status: string;
  working_hours: number;
  overtime_hours: number;
  base_pay: number;
  overtime_pay: number;
  deductions: number;
  bonus: number;
  document_url?: string;
  document_name?: string;
  salary_paid: number;
  department?: string;
  status?: string;
  pay_period?: string; // Added for compatibility
  gross_pay?: number; // Added for compatibility
  taxes?: number; // Added for compatibility
  net_pay?: number; // Added for compatibility
}
