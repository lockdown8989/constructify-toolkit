
export type ViewType = 'day' | 'week';

// Add more specific types for calendar operations to improve type safety
export interface CalendarViewProps {
  view: ViewType;
  date: Date;
  onDateChange?: (date: Date) => void;
  onViewChange?: (view: ViewType) => void;
}
