
// Types for availability requests
export type AvailabilityStatus = 'Pending' | 'Approved' | 'Rejected';

export type AvailabilityRequest = {
  id: string;
  employee_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  notes: string | null;
  status: AvailabilityStatus;
  created_at: string;
  updated_at: string;
  employees?: {
    name: string;
    department: string;
    job_title: string;
  };
};

export type NewAvailabilityRequest = {
  employee_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  notes?: string | null;
  status?: AvailabilityStatus;
};

export type UpdateAvailabilityRequest = Partial<AvailabilityRequest> & { id: string };
