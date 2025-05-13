
export interface Interview {
  id: string;
  candidate_name: string;
  stage: string;
  progress: number;
  notes?: string;
  feedback?: string;
  interviewer_id?: string;
  scheduled_date?: string;
  status?: string;
}
