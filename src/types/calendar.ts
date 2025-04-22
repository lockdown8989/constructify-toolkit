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
  mobile_view_settings: MobileViewSettings;
}

interface MobileViewSettings {
  font_size: 'small' | 'medium' | 'large';
  compact_view: boolean;
  days_visible: number;
  auto_refresh: boolean;
}

interface MobileFriendlyView {
  font_size: 'small' | 'medium' | 'large';
  compact_view: boolean;
  high_contrast: boolean;
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
  mobile_friendly_view?: MobileFriendlyView;
}
