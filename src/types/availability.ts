
/**
 * Defines the possible status values for an availability request
 */
export type AvailabilityStatus = 'Pending' | 'Approved' | 'Rejected';

/**
 * Represents an availability request in the system
 */
export interface AvailabilityRequest {
  id: string;
  employee_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  status: AvailabilityStatus;
  notes?: string;
  manager_notes?: string;
  created_at: string;
  updated_at: string;
  audit_log?: any[];
  reviewer_id?: string;
  // Include the joined employee data
  employees?: {
    name: string;
    department?: string;
    job_title?: string;
  };
}

/**
 * Type for creating a new availability request
 */
export interface NewAvailabilityRequest {
  employee_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available?: boolean;
  notes?: string;
  status?: AvailabilityStatus;
}

/**
 * Type for updating an existing availability request
 */
export interface UpdateAvailabilityRequest {
  id: string;
  status?: AvailabilityStatus;
  notes?: string;
  manager_notes?: string;
  reviewer_id?: string;
}
