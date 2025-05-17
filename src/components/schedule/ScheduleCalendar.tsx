
import React from 'react';
import { useSchedules } from '@/hooks/use-schedules';
import { useAuth } from '@/hooks/use-auth';
import { useIsMobile } from '@/hooks/use-mobile';
import CalendarHeader from './components/CalendarHeader';
import DayViewComponent from './views/DayViewComponent';
import WeekViewComponent from './views/WeekViewComponent';
import AddShiftButton from './components/AddShiftButton';
import AddShiftSheet from './components/AddShiftSheet';
import { useCalendarState } from './hooks/useCalendarState';
import { getEventPosition, getEventColor } from './utilities/eventUtils';

const ScheduleCalendar = () => {
  const { data: schedules = [] } = useSchedules();
  const { isAdmin, isManager, isHR } = useAuth();
  const isMobile = useIsMobile();
  const hasManagerAccess = isAdmin || isManager || isHR;
  
  const {
    currentDate,
    view,
    setView,
    isCurrentDateToday,
    isAddSheetOpen,
    setIsAddSheetOpen,
    handlePrevious,
    handleNext,
    handleToday,
    handleAddShift,
    handleSubmitAddShift
  } = useCalendarState();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <CalendarHeader 
          currentDate={currentDate}
          view={view}
          setView={setView}
          handlePrevious={handlePrevious}
          handleNext={handleNext}
          handleToday={handleToday}
          isToday={isCurrentDateToday}
        />
        
        {/* Add shift button for managers */}
        <AddShiftButton 
          onClick={handleAddShift} 
          hasManagerAccess={hasManagerAccess} 
        />
      </div>
      
      {view === 'day' ? (
        <DayViewComponent
          currentDate={currentDate}
          schedules={schedules}
          currentTimeTop={0} // This will be calculated inside the TimeIndicator component
          getEventPosition={getEventPosition}
          getEventColor={getEventColor}
        />
      ) : (
        <WeekViewComponent 
          currentDate={currentDate}
          schedules={schedules}
          getEventColor={getEventColor}
        />
      )}
      
      {/* Add shift sheet dialog */}
      <AddShiftSheet 
        isOpen={isAddSheetOpen}
        onOpenChange={setIsAddSheetOpen}
        onSubmit={handleSubmitAddShift}
        currentDate={currentDate}
        isMobile={isMobile}
      />
    </div>
  );
};

export default ScheduleCalendar;
