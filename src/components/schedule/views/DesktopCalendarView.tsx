
import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import WeeklyCalendarView from '../WeeklyCalendarView';

// The proper handler interface 
interface ShiftSubmitters {
  handleAddShiftSubmit: (formData: any) => void;
  handleEmployeeShiftSubmit: (formData: any) => void;
  handleSwapShiftSubmit: (formData: any) => void;
  handleAddShiftClose: () => void;
  handleEmployeeShiftClose: () => void;
  handleSwapShiftClose: () => void;
  handleEmployeeAddShift: (employeeId: string, date: Date) => void;
}

// Update the component props to match
interface DesktopCalendarViewProps {
  shiftState: any;
  handleSubmitters: ShiftSubmitters;
}

const DesktopCalendarView: React.FC<DesktopCalendarViewProps> = ({ shiftState, handleSubmitters }) => {
  const { 
    selectedDate, 
    schedules, 
    visibleDays,
    handleNextPeriod, 
    handlePreviousPeriod, 
    handleToday,
    handleAddShift,
    handleAddEmployeeShift
  } = shiftState;

  console.log('DesktopCalendarView rendered', { 
    selectedDate: selectedDate?.toISOString(),
    visibleDaysCount: visibleDays?.length,
    schedulesCount: schedules?.length,
    handlersAvailable: !!handleSubmitters,
    handleEmployeeAddShift: !!handleSubmitters.handleEmployeeAddShift
  });
  
  return (
    <div className="p-4">
      {/* Calendar navigation */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          <Button onClick={handlePreviousPeriod} variant="outline" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button onClick={handleToday} variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-1" />
            Today
          </Button>
          <Button onClick={handleNextPeriod} variant="outline" size="sm">
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        <h2 className="text-lg font-semibold">
          {format(selectedDate, 'MMMM yyyy')}
        </h2>
      </div>
      
      {/* Weekly Calendar View */}
      <WeeklyCalendarView 
        startDate={selectedDate}
        onDateChange={handleToday}
        schedules={schedules}
        onAddShift={handleAddShift}
        onAddEmployeeShift={handleAddEmployeeShift}
      />
    </div>
  );
};

export default DesktopCalendarView;
