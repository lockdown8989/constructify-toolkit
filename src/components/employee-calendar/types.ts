
import { Dispatch, SetStateAction } from 'react';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color: string;
}

export type ViewMode = 'day' | 'week';

export interface CalendarProps {
  events: CalendarEvent[];
  currentDate: Date;
  viewMode: ViewMode;
  getEventsForDay: (day: Date) => CalendarEvent[];
  formatEventTime: (start: Date, end: Date) => string;
}
