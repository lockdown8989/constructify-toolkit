
import React from 'react';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ViewMode } from './types';

interface CalendarNavigationProps {
  currentDate: Date;
  viewMode: ViewMode;
  handlePrevious: () => void;
  handleNext: () => void;
  handleToday: () => void;
  weekDays: Date[];
}

const CalendarNavigation: React.FC<CalendarNavigationProps> = ({
  currentDate,
  viewMode,
  handlePrevious,
  handleNext,
  handleToday,
  weekDays
}) => {
  return (
    <div className="flex justify-between items-center p-3 bg-gray-50 border-b">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handlePrevious} className="h-8 w-8 p-0">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Button variant="outline" size="sm" onClick={handleToday} className="h-8">
          Today
        </Button>
        
        <Button variant="outline" size="sm" onClick={handleNext} className="h-8 w-8 p-0">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="text-base font-medium">
        {viewMode === 'day' 
          ? format(currentDate, 'MMMM d, yyyy')
          : `${format(weekDays[0], 'MMM d')} - ${format(weekDays[6], 'MMM d, yyyy')}`
        }
      </div>
      
      <div className="w-20">
        {/* Spacer for flex alignment */}
      </div>
    </div>
  );
};

export default CalendarNavigation;
