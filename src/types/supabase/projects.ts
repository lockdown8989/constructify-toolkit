
export interface Project {
  id: string;
  name: string;
  department: string;
  deadline: string;
  priority: string;
  created_at: string | null;
  description?: string;
  manager_id?: string;
  status?: string;
  team_members?: string[];
}
