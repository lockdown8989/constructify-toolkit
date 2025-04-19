
import { Schedule as BaseSchedule } from "@/hooks/use-schedules";

export interface EnhancedSchedule extends BaseSchedule {
  status?: 'confirmed' | 'pending' | 'completed';
  location?: string;
  manager_id?: string;
  break_duration?: number;
  coworkers?: string[];
  is_published?: boolean;
}
