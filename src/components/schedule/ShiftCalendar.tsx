
import React, { useState, useEffect } from 'react';
import { useShiftCalendarState } from './hooks/useShiftCalendarState';
import { createShiftCalendarHandlers } from './utils/shiftCalendarHandlers';
import MobileCalendarView from './views/MobileCalendarView';
import DesktopCalendarView from './views/DesktopCalendarView';
import AddShiftFAB from './calendar/AddShiftFAB';
import AddShiftSheet from './components/AddShiftSheet';
import DateActionMenu from './calendar/DateActionMenu';

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
    handleEmployeeAddShift,
    isDateActionMenuOpen,
    setIsDateActionMenuOpen
  } = shiftState;
  
  // Get handlers for the calendar
  const handleSubmitters = createShiftCalendarHandlers(shiftState) as ShiftSubmitters;

  // For debugging - logs to help troubleshoot
  useEffect(() => {
    console.log('ShiftCalendar: State update', { 
      isAddShiftOpen, 
      selectedDay: selectedDay?.toISOString() || 'none',
      isDateActionMenuOpen
    });
  }, [isAddShiftOpen, selectedDay, isDateActionMenuOpen]);

  // If on mobile, render the mobile schedule view
  if (isMobile) {
    return (
      <>
        <MobileCalendarView shiftState={shiftState} handleSubmitters={handleSubmitters} />
        
        <AddShiftSheet
          isOpen={isAddShiftOpen}
          onOpenChange={setIsAddShiftOpen}
          onSubmit={handleSubmitAddShift}
          currentDate={selectedDay || new Date()}
          isMobile={true}
        />
        
        <DateActionMenu
          isOpen={isDateActionMenuOpen}
          onClose={() => setIsDateActionMenuOpen(false)}
          onAddShift={() => {
            console.log('DateActionMenu: Opening AddShiftSheet');
            setIsAddShiftOpen(true);
          }}
          onAddEmployee={() => console.log('Add employee clicked from mobile')}
          hasManagerAccess={isAdmin || isManager || isHR}
          selectedDate={selectedDay}
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
        onClick={() => {
          console.log('FAB clicked, setting selectedDay to current date');
          handleAddShift(new Date());
        }}
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
      
      {/* Date action menu for desktop */}
      <DateActionMenu
        isOpen={isDateActionMenuOpen}
        onClose={() => setIsDateActionMenuOpen(false)}
        onAddShift={() => {
          console.log('DateActionMenu: Opening AddShiftSheet from desktop');
          setIsAddShiftOpen(true);
        }}
        onAddEmployee={() => console.log('Add employee clicked from desktop')}
        hasManagerAccess={isAdmin || isManager || isHR}
        selectedDate={selectedDay}
      />
    </>
  );
};

export default ShiftCalendar;
