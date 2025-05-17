
import React from 'react';
import { useShiftCalendarState } from './hooks/useShiftCalendarState';
import { createShiftCalendarHandlers } from './utils/shiftCalendarHandlers';
import MobileCalendarView from './views/MobileCalendarView';
import DesktopCalendarView from './views/DesktopCalendarView';
import AddShiftFAB from './calendar/AddShiftFAB';

const ShiftCalendar = () => {
  const shiftState = useShiftCalendarState();
  const { isMobile, isAdmin, isManager, isHR, handleAddShift } = shiftState;
  
  // Get handlers for the calendar
  const handleSubmitters = createShiftCalendarHandlers(shiftState);

  // If on mobile, render the mobile schedule view
  if (isMobile) {
    return <MobileCalendarView shiftState={shiftState} handleSubmitters={handleSubmitters} />;
  }

  // Desktop view
  return (
    <>
      <DesktopCalendarView shiftState={shiftState} handleSubmitters={handleSubmitters} />
      
      {/* FAB for desktop view - positioned at bottom right */}
      <AddShiftFAB
        onClick={() => handleAddShift(new Date())}
        isVisible={isAdmin || isManager || isHR}
      />
    </>
  );
};

export default ShiftCalendar;
