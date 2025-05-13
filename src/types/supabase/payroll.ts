
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
  tax_code?: string;
  ni_number?: string;
  payment_method?: string;
  pay_period?: string;
  tax_paid?: number;
  ni_contribution?: number;
  other_deductions?: number;
  pension_contribution?: number;
  ytd_gross?: number;
  ytd_tax?: number;
  ytd_ni?: number;
  ytd_other?: number;
  ytd_net?: number;
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
  };
}
