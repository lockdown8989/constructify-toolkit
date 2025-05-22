
import React, { useState, useEffect } from 'react';
import { useShiftCalendarState } from './hooks/useShiftCalendarState';
import { createShiftCalendarHandlers } from './utils/shiftCalendarHandlers';
import MobileCalendarView from './views/MobileCalendarView';
import DesktopCalendarView from './views/DesktopCalendarView';
import AddShiftFAB from './calendar/AddShiftFAB';
import AddShiftSheet from './components/AddShiftSheet';

// Define a proper type for the handlers
interface ShiftSubmitters {
  handleAddShiftSubmit: (formData: any) => void;
  handleEmployeeShiftSubmit: (formData: any) => void;
  handleSwapShiftSubmit: (formData: any) => void;
  handleAddShiftClose: () => void;
  handleEmployeeShiftClose: () => void;
  handleSwapShiftClose: () => void;
  handleEmployeeAddShift: (employeeId: string, date: Date) => void;
}

const ShiftCalendar = () => {
  const shiftState = useShiftCalendarState();
  const { 
    isMobile, 
    isAdmin, 
    isManager, 
    isHR, 
    handleAddShift, 
    isAddShiftOpen, 
    setIsAddShiftOpen, 
    selectedDay, 
    handleSubmitAddShift,
    handleEmployeeAddShift // Make sure this is properly destructured
  } = shiftState;
  
  // Get handlers for the calendar
  const handleSubmitters = createShiftCalendarHandlers(shiftState) as ShiftSubmitters;

  // Log for debugging
  console.log('ShiftCalendar component rendered', { 
    isAddShiftOpen, 
    selectedDay: selectedDay?.toISOString() || 'none',
    handlersCreated: !!handleSubmitters,
    handleEmployeeAddShift: !!handleEmployeeAddShift
  });

  // If on mobile, render the mobile schedule view
  if (isMobile) {
    return (
      <>
        <MobileCalendarView shiftState={shiftState} handleSubmitters={handleSubmitters} />
        {/* Include AddShiftSheet for mobile */}
        <AddShiftSheet
          isOpen={isAddShiftOpen}
          onOpenChange={setIsAddShiftOpen}
          onSubmit={handleSubmitAddShift}
          currentDate={selectedDay || new Date()}
          isMobile={isMobile}
        />
      </>
    );
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
      
      {/* Include AddShiftSheet for desktop */}
      <AddShiftSheet
        isOpen={isAddShiftOpen}
        onOpenChange={setIsAddShiftOpen}
        onSubmit={handleSubmitAddShift}
        currentDate={selectedDay || new Date()}
        isMobile={false}
      />
    </>
  );
};

export default ShiftCalendar;
