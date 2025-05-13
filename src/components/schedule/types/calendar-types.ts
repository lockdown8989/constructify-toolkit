
export type ViewType = 'day' | 'week' | 'month';

// Add missing interface for proper typings
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type?: string;
  status?: string;
  employee_id?: string;
}
