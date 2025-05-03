
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
