
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
}
