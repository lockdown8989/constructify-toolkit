
export interface Project {
  id: string;
  name: string;
  department: string;
  deadline: string;
  priority: string;
  created_at: string | null;
  status?: 'pending' | 'in-progress' | 'completed' | 'on-hold';
  description?: string;
  manager_id?: string;
  estimated_hours?: number;
  budget?: number;
  completion_percentage?: number;
}
