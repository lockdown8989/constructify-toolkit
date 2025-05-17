
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
import WeekNavigation from './components/WeekNavigation';

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
      <div className={`flex ${isMobile ? 'flex-col gap-2' : 'justify-between items-center'}`}>
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
        {!isMobile && (
          <AddShiftButton 
            onClick={handleAddShift} 
            hasManagerAccess={hasManagerAccess} 
          />
        )}
      </div>
      
      {isMobile && (
        <div className="mb-2">
          <WeekNavigation
            currentDate={currentDate}
            onPreviousWeek={handlePrevious}
            onNextWeek={handleNext}
            onSelectToday={handleToday}
            isMobile={true}
            viewType={view}
          />
        </div>
      )}
      
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
      
      {/* Mobile FAB */}
      {isMobile && hasManagerAccess && (
        <div className="fixed bottom-20 right-6 z-50">
          <button
            onClick={handleAddShift}
            className="h-14 w-14 rounded-full bg-blue-500 text-white shadow-lg flex items-center justify-center hover:bg-blue-600 active-touch-state"
            aria-label="Add shift"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus">
              <path d="M5 12h14"></path>
              <path d="M12 5v14"></path>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default ScheduleCalendar;
