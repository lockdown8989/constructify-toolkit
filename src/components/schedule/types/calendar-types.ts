
export type ViewType = 'day' | 'week' | 'month';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  color?: string;
  description?: string;
}

export interface CalendarDay {
  date: Date;
  events: CalendarEvent[];
  isToday: boolean;
  isCurrentMonth: boolean;
}

export interface CalendarWeek {
  days: CalendarDay[];
}

export interface ShiftCalendarState {
  isAdmin: boolean;
  isHR: boolean;
  isManager: boolean;
  schedules: any[];
  isLoading: boolean;
  selectedDate: Date;
  visibleDays: Date[];
  locationName: string;
  setLocationName: (name: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  weekView: boolean;
  setWeekView: (view: boolean) => void;
  selectedDay: Date | null;
  isAddShiftOpen: boolean;
  setIsAddShiftOpen: (open: boolean) => void;
  isSwapShiftOpen: boolean;
  setIsSwapShiftOpen: (open: boolean) => void;
  isAddEmployeeShiftOpen: boolean;
  setIsAddEmployeeShiftOpen: (open: boolean) => void;
  selectedEmployee: string | null;
  setSelectedEmployee: (employee: string | null) => void;
  selectedShift: any | null;
  setSelectedShift: (shift: any | null) => void;
  employees: any[];
  isMobile: boolean;
  allEmployeeSchedules: any[];
  handleNextPeriod: () => void;
  handlePreviousPeriod: () => void;
  handleToday: () => void;
  handleAddShift: (date: Date) => void;
  handleSwapShift: (date: Date) => void;
  handleAddEmployeeShift: (date: Date) => void;
  handleSubmitAddShift: (data: any) => void;
  handleSubmitEmployeeShift: (data: any) => void;
  handleSubmitSwapShift: (data: any) => void;
  handleShiftClick: (shift: any) => void;
}

export interface ShiftCalendarProps {
  shiftState: ShiftCalendarState;
  handleSubmitters: {
    handleAddShiftSubmit: () => void;
    handleSwapShiftSubmit: () => void;
    handleEmployeeShiftSubmit: () => void;
    handleEmployeeAddShift: (employeeId: string, date: Date) => void;
  };
}

// Define calendar preference settings
export interface CalendarPreferences {
  default_view: ViewType;
  show_weekends: boolean;
  color_scheme: string;
  visible_hours: {
    start: number;
    end: number;
  };
  mobile_view_settings: {
    font_size: 'small' | 'medium' | 'large';
    compact_view: boolean;
    days_visible: number;
    auto_refresh: boolean;
  };
}
