
import React from 'react';
import { format } from 'date-fns';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ShiftCalendarToolbar from '../components/ShiftCalendarToolbar';
import { useIsMobile } from '@/hooks/use-mobile';

interface DateControlsProps {
  selectedDate: Date;
  weekView: boolean;
  setWeekView: (isWeekView: boolean) => void;
  handlePreviousPeriod: () => void;
  handleNextPeriod: () => void;
  handleToday: () => void;
}

const DateControls: React.FC<DateControlsProps> = ({
  selectedDate,
  weekView,
  setWeekView,
  handlePreviousPeriod,
  handleNextPeriod,
  handleToday
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`${isMobile ? 'p-3' : 'p-4'} flex flex-wrap justify-between items-center border-b`}>
      <div className="flex items-center mb-2 sm:mb-0">
        <CalendarIcon className="h-5 w-5 mr-2 text-gray-600" />
        <span className="font-medium">{format(selectedDate, 'MMMM d, yyyy')}</span>
      </div>
      
      <div className={`flex ${isMobile ? 'flex-col w-full gap-2' : 'items-center gap-4'}`}>
        <ShiftCalendarToolbar 
          viewType={weekView ? 'week' : 'day'}
          onViewChange={(type) => setWeekView(type === 'week')}
        />
        
        <div className={`flex items-center ${isMobile ? 'justify-between w-full' : 'gap-2'}`}>
          <Button variant="ghost" size="sm" onClick={handleToday}>
            Today
          </Button>
          
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={handlePreviousPeriod} className="h-8 w-8 p-0 mr-1">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button variant="ghost" size="sm" onClick={handleNextPeriod} className="h-8 w-8 p-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateControls;
