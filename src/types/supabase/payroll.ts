
export interface PayrollRecord {
  id: string;
  employee_id: string | null;
  payment_date: string | null;
  working_hours: number | null;
  overtime_hours: number | null;
  base_pay: number | null;
  overtime_pay: number | null;
  deductions: number | null;
  payment_status: string | null;
  bonus: number | null;
  document_url: string | null;
  document_name: string | null;
  salary_paid: number | null;
}

export interface PayslipData {
  id: string;
  employeeId: string;
  employeeName: string;
  position: string;
  department: string;
  period: string;
  paymentDate: string;
  baseSalary: number;
  grossPay: number;
  deductions: number;
  netPay: number;
  currency: string;
  bankAccount?: string;
  notes?: string;
  title?: string;
  salary?: string | number;
}

// For backward compatibility
export interface Employee {
  id: string;
  name: string;
  job_title?: string;
  title?: string; 
  salary?: string | number;
  status?: "Paid" | "Pending" | "Absent";
  paymentDate?: string;
  department?: string;
  site?: string;
  avatar?: string;
  selected?: boolean;
}

export interface PayrollHistoryRecord {
  id: string;
  month: string;
  total_paid: number;
  employees_paid: number;
  created_at: string;
  status: string;
  processed_by: string;
}
