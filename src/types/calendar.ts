
export interface CalendarPreferences {
  id: string;
  employee_id: string;
  default_view: 'day' | 'week' | 'month';
  visible_hours: {
    start: number;
    end: number;
  };
  show_weekends: boolean;
  color_scheme: string;
}

export interface ScheduleTemplate {
  id: string;
  title: string;
  shift_type: string;
  start_time: string;
  end_time: string;
  days_of_week: string[];
  color?: string;
  role?: string;
  location?: string;
  notes?: string;
}
