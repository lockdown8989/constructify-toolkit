
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
import { Button } from '@/components/ui/button';
import { PlusCircle, UserPlus } from 'lucide-react';
import NewScheduleDialog from './components/NewScheduleDialog';
import { useEmployees } from '@/hooks/use-employees';
import { ViewType } from './types/calendar-types';

const ScheduleCalendar = () => {
  const { data: schedules = [] } = useSchedules();
  const { isAdmin, isManager, isHR } = useAuth();
  const isMobile = useIsMobile();
  const hasManagerAccess = isAdmin || isManager || isHR;
  const { data: employeeList = [] } = useEmployees({});
  
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

  // State for the new employee shift dialog
  const [isAddEmployeeShiftOpen, setIsAddEmployeeShiftOpen] = React.useState(false);

  // Function to handle adding an employee shift
  const handleAddEmployeeShift = () => {
    setIsAddEmployeeShiftOpen(true);
  };

  // Function to handle view type changes
  const handleViewChange = (newView: ViewType) => {
    setView(newView);
  };

  return (
    <div className="space-y-4">
      <div className={`flex ${isMobile ? 'flex-col gap-2' : 'justify-between items-center'}`}>
        <CalendarHeader 
          currentDate={currentDate}
          view={view}
          setView={handleViewChange}
          handlePrevious={handlePrevious}
          handleNext={handleNext}
          handleToday={handleToday}
          isToday={isCurrentDateToday}
        />
        
        {/* Manager Actions */}
        {!isMobile && hasManagerAccess && (
          <div className="flex space-x-2">
            <Button 
              size="sm"
              variant="outline" 
              className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white"
              onClick={handleAddShift}
            >
              <PlusCircle size={16} />
              Add Open Shift
            </Button>
            <Button 
              size="sm"
              variant="outline" 
              className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white"
              onClick={handleAddEmployeeShift}
            >
              <UserPlus size={16} />
              Add Employee Shift
            </Button>
          </div>
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
      
      {/* Add shift sheet dialog - Note the correct passing of handleSubmitAddShift */}
      <AddShiftSheet 
        isOpen={isAddSheetOpen}
        onOpenChange={setIsAddSheetOpen}
        onSubmit={handleSubmitAddShift}
        currentDate={currentDate}
        isMobile={isMobile}
      />
      
      {/* Add employee shift dialog */}
      <NewScheduleDialog
        isOpen={isAddEmployeeShiftOpen}
        onClose={() => setIsAddEmployeeShiftOpen(false)}
        employees={employeeList}
      />
      
      {/* Mobile FAB for managers */}
      {isMobile && hasManagerAccess && (
        <div className="fixed bottom-20 right-6 z-50 flex flex-col gap-2">
          <button
            onClick={handleAddEmployeeShift}
            className="h-14 w-14 rounded-full bg-green-500 text-white shadow-lg flex items-center justify-center hover:bg-green-600 active-touch-state"
            aria-label="Add employee shift"
          >
            <UserPlus size={24} />
          </button>
          <button
            onClick={handleAddShift}
            className="h-14 w-14 rounded-full bg-blue-500 text-white shadow-lg flex items-center justify-center hover:bg-blue-600 active-touch-state"
            aria-label="Add open shift"
          >
            <PlusCircle size={24} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ScheduleCalendar;
