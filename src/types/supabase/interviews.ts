
export interface Interview {
  id: string;
  candidate_name: string;
  stage: string;
  progress: number;
  hiring_manager?: string;
  department?: string;
  interview_date?: string;
  status?: 'scheduled' | 'completed' | 'cancelled';
  feedback?: string;
  created_at?: string;
  updated_at?: string;
}
