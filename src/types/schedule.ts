
import { Schedule as BaseSchedule } from "@/hooks/use-schedules";

export interface EnhancedSchedule extends BaseSchedule {
  status?: 'confirmed' | 'pending' | 'completed';
  location?: string;
  manager_id?: string;
  break_duration?: number;
  coworkers?: string[];
  requirements?: Record<string, any>;
  cost_center?: string;
  hourly_rate?: number;
  estimated_cost?: number;
}

export interface ShiftTemplate {
  id: string;
  name: string;
  role?: string;
  start_time: string;
  end_time: string;
  break_duration: number;
  days_of_week: number[];
  location?: string;
  requirements: Record<string, any>;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface AvailabilityPattern {
  id: string;
  employee_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  max_hours?: number;
  preferences: Record<string, any>;
  effective_from: string;
  effective_until?: string;
}

export interface ScheduleConflict {
  id: string;
  schedule_id: string;
  conflict_type: 'overlap' | 'availability' | 'overtime' | 'skills';
  conflict_details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
  created_at: string;
}

export interface LaborCost {
  id: string;
  schedule_id: string;
  base_cost: number;
  overtime_cost: number;
  break_cost: number;
  total_cost: number;
  calculated_at: string;
}
