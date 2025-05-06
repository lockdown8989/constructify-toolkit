
import React from 'react';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ShiftCalendarToolbarProps {
  visibleDays: Date[];
  onNext: () => void;
  onPrevious: () => void;
  isMobile: boolean;
}

const ShiftCalendarToolbar: React.FC<ShiftCalendarToolbarProps> = ({
  visibleDays,
  onNext,
  onPrevious,
  isMobile
}) => {
  // No days available
  if (!visibleDays.length) {
    return null;
  }
  
  return (
    <div className="grid grid-cols-[120px_1fr] border-b border-gray-200">
      {/* Empty cell in top-left */}
      <div className="border-r border-gray-200 bg-gray-50 flex items-center justify-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onPrevious}
          className="h-8 w-8 mr-1"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onNext}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Day headers */}
      <div className="grid grid-cols-2">
        {visibleDays.map((day, index) => {
          const isToday = new Date().toDateString() === day.toDateString();
          
          return (
            <div 
              key={index}
              className={`py-3 px-2 text-center border-r border-gray-200 ${isToday ? 'text-blue-500 font-semibold' : ''}`}
            >
              <div className={`${isToday ? 'text-blue-500' : ''}`}>
                {format(day, 'EEE d MMM')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ShiftCalendarToolbar;
