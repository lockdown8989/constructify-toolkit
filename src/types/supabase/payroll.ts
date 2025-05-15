
export interface PayrollRecord {
  id: string;
  employee_id: string | null;
  payment_date: string | null;
  working_hours: number | null;
  overtime_hours: number | null;
  base_pay: number | null;
  overtime_pay: number | null;
  salary_paid: number | null;
  deductions: number | null;
  bonus: number | null;
  payment_status: string | null;
  document_url: string | null;
  document_name: string | null;
  employee_name?: string;
}

export interface PayslipData {
  id: string;
  employeeName: string;
  employeeId: string;
  position: string;
  department: string;
  period: string;
  baseSalary: number;
  overtimePay: number;
  bonus: number;
  deductions: number;
  totalPay: number;
  currency: string;
}
