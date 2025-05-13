
import { Employee } from './employee';

// Define the base availability request type
export interface AvailabilityRequest {
  id: string;
  employee_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  status: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  audit_log?: any[];
  reviewer_id?: string | null;
  manager_notes?: string | null;
  // Include the joined employee data
  employees?: {
    name: string;
    department: string;
    job_title: string;
  };
}

// Define a type for creating a new availability request
export interface NewAvailabilityRequest {
  employee_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available?: boolean;
  notes?: string | null;
  status?: string;
}

// Define a type for updating an availability request
export interface UpdateAvailabilityRequest {
  id: string;
  status?: string;
  notes?: string | null;
  manager_notes?: string | null;
  reviewer_id?: string | null;
}
