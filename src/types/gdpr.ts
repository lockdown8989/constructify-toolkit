
export interface ConsentRecord {
  id: string;
  user_id: string;
  consent_type: 'marketing' | 'analytics' | 'functional' | 'necessary';
  consent_given: boolean;
  consent_date: string;
  consent_withdrawn_date?: string;
  privacy_policy_version?: string;
}

export interface DataProcessingLog {
  id: string;
  user_id: string;
  action_type: 'access' | 'update' | 'delete' | 'export' | 'anonymize';
  table_name: string;
  legal_basis: string;
  created_at: string;
}

export interface UserDataExport {
  export_date: string;
  user_id: string;
  profile: any;
  employee_data: any;
  consent_records: ConsentRecord[];
  attendance_summary: any;
  notifications_count: number;
  data_processing_log: DataProcessingLog[];
}
