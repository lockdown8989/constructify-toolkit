
import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, addDays, startOfWeek, endOfMonth, startOfMonth } from 'date-fns';
import { ViewType } from '../types/calendar-types';

interface WeekNavigationProps {
  currentDate: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onSelectToday: () => void;
  isMobile: boolean;
  viewType?: ViewType;
}

const WeekNavigation: React.FC<WeekNavigationProps> = ({
  currentDate,
  onPreviousWeek,
  onNextWeek,
  onSelectToday,
  isMobile,
  viewType = 'week'
}) => {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);
  
  let formattedRange;
  
  if (viewType === 'month') {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    formattedRange = format(monthStart, 'MMMM yyyy');
  } else if (viewType === 'day') {
    formattedRange = format(currentDate, isMobile ? 'MMM d' : 'MMMM d, yyyy');
  } else {
    formattedRange = isMobile
      ? `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`
      : `${format(weekStart, 'MMMM d')} - ${format(weekEnd, 'MMMM d')}`;
  }
    
  return (
    <div className={`flex items-center justify-between ${isMobile ? 'week-nav-mobile' : 'mb-4'}`}>
      <Button
        variant="ghost"
        size={isMobile ? "sm" : "default"}
        onClick={onPreviousWeek}
        className={`${isMobile ? "h-8 w-8 p-0 active-touch-state" : ""} rounded-xl`}
      >
        <ChevronLeft className={isMobile ? "h-4 w-4" : "h-5 w-5"} />
        {!isMobile && <span className="ml-1">Previous</span>}
      </Button>
      
      <div className="flex items-center">
        {isMobile ? (
          <span className="text-sm font-medium">{formattedRange}</span>
        ) : (
          <span className="text-base font-medium">{formattedRange}</span>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onSelectToday}
          className={`${isMobile ? "ml-2 p-1 h-7 active-touch-state" : "ml-3"} rounded-xl`}
        >
          <Calendar className={isMobile ? "h-3 w-3" : "h-4 w-4 mr-1"} />
          {!isMobile && <span>Today</span>}
        </Button>
      </div>
      
      <Button
        variant="ghost"
        size={isMobile ? "sm" : "default"}
        onClick={onNextWeek}
        className={`${isMobile ? "h-8 w-8 p-0 active-touch-state" : ""} rounded-xl`}
      >
        {!isMobile && <span className="mr-1">Next</span>}
        <ChevronRight className={isMobile ? "h-4 w-4" : "h-5 w-5"} />
      </Button>
    </div>
  );
};

export default WeekNavigation;
