
export interface PayrollRecord {
  id: string;
  employee_id: string;
  base_pay: number;
  salary_paid: number;
  deductions: number;
  working_hours: number;
  overtime_hours: number;
  overtime_pay: number;
  payment_status: string;
  payment_date: string;
  processing_date: string;
  document_url?: string;
  document_name?: string;
  bonus?: number;
}

export interface PayrollHistoryRecord {
  id: string;
  employee_count: number;
  success_count: number;
  fail_count: number;
  processed_by: string;
  processing_date: string;
  employee_ids: string[];
  profiles?: {
    first_name: string;
    last_name: string;
  }
}
