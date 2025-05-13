
// Define types for payroll and payroll history
export interface Payroll {
  id: string;
  employee_id: string;
  salary_paid: number;
  base_pay?: number;
  overtime_hours?: number;
  overtime_pay?: number;
  working_hours?: number;
  payment_date?: string;
  document_url?: string;
  document_name?: string;
  payment_status?: string;
  processing_date?: string;
  bonus?: number;
  deductions?: number;
}

export interface PayrollHistory {
  id: string;
  employee_count: number;
  success_count: number;
  fail_count: number;
  processed_by?: string;
  employee_ids: string[];
  processing_date?: string;
  created_at?: string;
}
