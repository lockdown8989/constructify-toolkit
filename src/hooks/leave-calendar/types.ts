
import type { Database } from '@/types/supabase';

export type LeaveCalendar = Database['public']['Tables']['leave_calendar']['Row'];
export type NewLeaveCalendar = Database['public']['Tables']['leave_calendar']['Insert'];
export type LeaveCalendarUpdate = Database['public']['Tables']['leave_calendar']['Update'];
