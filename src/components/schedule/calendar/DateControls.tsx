
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import ShiftCalendarToolbar from '../components/ShiftCalendarToolbar';
import { useAccessControl } from '@/hooks/leave/useAccessControl';

interface DateControlsProps {
  selectedDate: Date;
  weekView: boolean;
  setWeekView: (view: boolean) => void;
  handlePreviousPeriod: () => void;
  handleNextPeriod: () => void;
  handleToday: () => void;
  onAddShift?: () => void;
}

const DateControls: React.FC<DateControlsProps> = ({
  selectedDate,
  weekView,
  setWeekView,
  handlePreviousPeriod,
  handleNextPeriod,
  handleToday,
  onAddShift
}) => {
  const handleViewChange = (view: string) => {
    setWeekView(view === 'week');
  };

  return (
    <div className="flex flex-wrap justify-between items-center p-4 border-b">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" onClick={handlePreviousPeriod}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <ShiftCalendarToolbar 
          currentDate={selectedDate}
          onDateChange={() => handleToday()}
          viewType={weekView ? 'week' : 'day'}
          onViewChange={handleViewChange}
          onAddShift={onAddShift}
        />
        
        <Button variant="outline" size="icon" onClick={handleNextPeriod}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default DateControls;
