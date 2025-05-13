
export interface PayrollDocument {
  id: string;
  employee_id: string;
  name: string;
  path?: string;
  url?: string;
  size?: string;
  created_at?: string;
  document_type: 'payslip' | 'tax' | 'benefit' | 'other';
}

export interface PayrollRecord {
  id: string;
  employee_id: string;
  base_pay: number;
  overtime_pay: number;
  bonus: number;
  deductions: number;
  salary_paid: number;
  payment_status: 'pending' | 'processed' | 'failed';
  payment_date: string;
  processing_date: string;
  document_name?: string;
  document_url?: string;
  working_hours: number;
  overtime_hours: number;
}

export interface PayrollProcessingHistory {
  id: string;
  processed_by: string;
  processing_date: string;
  employee_count: number;
  success_count: number;
  fail_count: number;
  employee_ids: string[];
  created_at: string;
}
