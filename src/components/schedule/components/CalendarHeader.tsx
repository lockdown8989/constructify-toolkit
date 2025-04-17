
import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { ViewType } from '../types/calendar-types';

interface CalendarHeaderProps {
  currentDate: Date;
  view: ViewType;
  setView: (view: ViewType) => void;
  handlePrevious: () => void;
  handleNext: () => void;
  handleToday: () => void;
  isToday: boolean;
}

const CalendarHeader = ({
  currentDate,
  view,
  setView,
  handlePrevious,
  handleNext,
  handleToday,
  isToday
}: CalendarHeaderProps) => {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">
          {view === 'day' 
            ? format(currentDate, 'EEEE, MMMM d, yyyy')
            : `Week of ${format(currentDate, 'MMMM d, yyyy')}`
          }
        </h3>
        {view === 'day' && (
          <div className="bg-gray-50 rounded-full px-3 py-1 text-sm text-gray-500 flex items-center">
            <Clock className="h-3.5 w-3.5 mr-1 text-blue-500" />
            {isToday ? 'Today' : ''}
          </div>
        )}
      </div>
      
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handlePrevious} className="rounded-full w-9 h-9 p-0 border-gray-200 shadow-sm">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleToday} className="font-medium rounded-full px-4 border-gray-200 shadow-sm">
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={handleNext} className="rounded-full w-9 h-9 p-0 border-gray-200 shadow-sm">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center bg-gray-100 rounded-full p-1">
          <Button 
            variant={view === 'day' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setView('day')}
            className="rounded-full"
          >
            Day
          </Button>
          <Button 
            variant={view === 'week' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setView('week')}
            className="rounded-full"
          >
            Week
          </Button>
        </div>
      </div>
    </>
  );
};

export default CalendarHeader;
