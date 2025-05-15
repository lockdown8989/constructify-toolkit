
export interface PayrollRecord {
  id: string;
  employee_id: string | null;
  employee_name?: string; // Add this field since it's being used
  pay_period?: string;
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
  gross_pay?: number;
  taxes?: number;
  net_pay?: number;
  department?: string;
  created_at?: string;
  processed_at?: string;
  status?: string;
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
  overtimePay?: number; // Add this field
  bonus?: number; // Add this field
  totalPay?: number; // Add this field
  name?: string; // For backward compatibility
  payPeriod?: string; // For backward compatibility
  taxes?: string | number; // For backward compatibility
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
  site?: string; // Add this to match Employee interface
  avatar?: string;
  selected?: boolean;
}
