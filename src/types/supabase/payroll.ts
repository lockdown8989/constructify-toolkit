
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
  pay_period?: string;
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
  name?: string; // Added to support existing references
  payPeriod?: string; // Added to support existing references
  salary?: string; // Added to support existing references
  grossPay?: string; // Added to support existing references
  netPay?: string; // Added to support existing references
  taxes?: string; // Added to support existing references
  paymentDate?: string; // Added to support existing references
  bankAccount?: string; // Added to support existing references
  title?: string; // Added to support existing references
}
