
import { Json } from '@/integrations/supabase/types';

export type LeaveEvent = {
  id: string;
  employee_id: string;
  type: string;
  start_date: string;
  end_date: string;
  status: string;
  notes?: string;
  audit_log?: Json | any[]; // Updated to handle both Json and array types
  employees?: { // Add optional employees property for joined data
    name: string;
    job_title: string;
    department: string;
  };
};

// Export this as LeaveCalendar for backward compatibility
export type LeaveCalendar = LeaveEvent;

export type LeaveRequest = Omit<LeaveEvent, 'id'>;
