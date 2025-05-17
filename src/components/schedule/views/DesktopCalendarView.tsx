
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import ScheduleHeader from '@/components/restaurant/ScheduleHeader';
import DayColumns from '@/components/schedule/calendar/DayColumns';
import CalendarGrid from '@/components/schedule/calendar/CalendarGrid';
import DateControls from '@/components/schedule/calendar/DateControls';
import CalendarFooter from '@/components/schedule/calendar/CalendarFooter';
import AddShiftPopover from '@/components/schedule/desktop/AddShiftPopover';
import SwapShiftPopover from '@/components/schedule/desktop/SwapShiftPopover';
import AddEmployeeShiftDialog from '@/components/schedule/components/AddEmployeeShiftDialog';
import { Employee } from '@/types/restaurant-schedule';
import { useShiftCalendarState } from '@/components/schedule/hooks/useShiftCalendarState';
import { ShiftCalendarProps } from '../types/calendar-types';
import DateActionMenu from '../calendar/DateActionMenu';

const DesktopCalendarView: React.FC<ShiftCalendarProps> = ({
  shiftState,
  handleSubmitters
}) => {
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null);
  
  const {
    isAdmin,
    isHR,
    isManager,
    selectedDate,
    visibleDays,
    locationName,
    setLocationName,
    searchQuery,
    setSearchQuery,
    weekView,
    setWeekView,
    selectedDay,
    isAddShiftOpen,
    setIsAddShiftOpen,
    isSwapShiftOpen,
    setIsSwapShiftOpen,
    isAddEmployeeShiftOpen,
    setIsAddEmployeeShiftOpen,
    selectedEmployee,
    setSelectedEmployee,
    selectedShift,
    setSelectedShift,
    handlePreviousPeriod,
    handleNextPeriod,
    handleToday,
    handleAddShift,
    handleSwapShift,
    handleShiftClick,
    allEmployeeSchedules,
    isLoading
  } = shiftState;
  
  const {
    handleAddShiftSubmit,
    handleSwapShiftSubmit,
    handleEmployeeShiftSubmit,
    handleEmployeeAddShift
  } = handleSubmitters;
  
  // Convert employees to the expected format with role and hourlyRate
  const employees: Employee[] = shiftState.employees.map(emp => ({
    id: emp.id,
    name: emp.name,
    role: emp.job_title || 'Employee', // Use job_title as role or default to 'Employee'
    hourlyRate: emp.hourly_rate || 0,
    avatarUrl: emp.avatar
  }));

  // Check if the current user has manager access
  const hasManagerAccess = isAdmin || isManager || isHR;

  // Handle date cell click to open menu
  const handleDateCellClick = (date: Date) => {
    setSelectedCalendarDate(date);
    setIsDateMenuOpen(true);
  };

  // Handle add shift from mini menu
  const handleAddShiftFromMenu = () => {
    if (selectedCalendarDate) {
      handleAddShift(selectedCalendarDate);
      setIsDateMenuOpen(false);
    }
  };

  // Handle add employee shift from mini menu
  const handleAddEmployeeFromMenu = () => {
    if (selectedCalendarDate) {
      shiftState.handleAddEmployeeShift(selectedCalendarDate);
      setIsDateMenuOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow overflow-hidden relative">
      {/* Custom header with location name */}
      <ScheduleHeader 
        locationName={locationName} 
        setLocationName={setLocationName}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        weekView={weekView}
        setWeekView={setWeekView}
      />
      
      {/* Day selector toolbar */}
      <div className="flex justify-between items-center p-4 border-b">
        <DateControls
          selectedDate={selectedDate}
          weekView={weekView}
          setWeekView={setWeekView}
          handlePreviousPeriod={handlePreviousPeriod}
          handleNextPeriod={handleNextPeriod}
          handleToday={handleToday}
        />
        
        <div className="flex items-center gap-2">
          {hasManagerAccess && (
            <>
              <Button
                onClick={() => handleAddShift(selectedDate)}
                variant="default"
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <span className="h-4 w-4 mr-1">+</span>
                Add Shift
              </Button>
              <Button
                onClick={() => shiftState.handleAddEmployeeShift(selectedDate)}
                variant="default"
                size="sm"
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <span className="h-4 w-4 mr-1">+</span>
                Add Employee Shift
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* Date column headers */}
      <DayColumns
        visibleDays={visibleDays}
        onAddShift={handleAddShift}
        onSwapShift={handleSwapShift}
        isManager={isManager}
        isAdmin={isAdmin}
        isHR={isHR}
        onDateClick={handleDateCellClick}
      />
      
      {/* Main grid */}
      <div className="overflow-y-auto flex-1">
        <div className="min-w-[400px]">
          <CalendarGrid
            allEmployeeSchedules={allEmployeeSchedules}
            visibleDays={visibleDays}
            isAdmin={isAdmin}
            isManager={isManager}
            isHR={isHR}
            handleAddShift={handleAddShift}
            handleShiftClick={handleShiftClick}
            handleEmployeeAddShift={handleEmployeeAddShift}
            isLoading={isLoading}
            onDateClick={handleDateCellClick}
          />
        </div>
      </div>
      
      {/* Display information about schedule updates */}
      <CalendarFooter />
      
      {/* Desktop popover for Add Shift */}
      <AddShiftPopover
        isOpen={isAddShiftOpen}
        onOpenChange={setIsAddShiftOpen}
        selectedDay={selectedDay}
        employees={employees}
        selectedEmployee={selectedEmployee}
        setSelectedEmployee={setSelectedEmployee}
        handleSubmit={handleAddShiftSubmit}
      />
      
      {/* Desktop popover for Swap Shift */}
      <SwapShiftPopover
        isOpen={isSwapShiftOpen}
        onOpenChange={setIsSwapShiftOpen}
        selectedDay={selectedDay}
        employees={employees}
        selectedEmployee={selectedEmployee}
        setSelectedEmployee={setSelectedEmployee}
        handleSubmit={handleSwapShiftSubmit}
        schedules={shiftState.schedules}
        selectedShift={selectedShift}
        setSelectedShift={setSelectedShift}
      />
      
      {/* Desktop dialog for Add Employee Shift */}
      <AddEmployeeShiftDialog
        isOpen={isAddEmployeeShiftOpen}
        onOpenChange={setIsAddEmployeeShiftOpen}
        selectedDay={selectedDay}
        employees={employees}
        selectedEmployee={selectedEmployee}
        setSelectedEmployee={setSelectedEmployee}
        handleSubmit={handleEmployeeShiftSubmit}
      />

      {/* Date Action Menu */}
      <DateActionMenu 
        isOpen={isDateMenuOpen}
        onClose={() => setIsDateMenuOpen(false)}
        onAddShift={handleAddShiftFromMenu}
        onAddEmployee={handleAddEmployeeFromMenu}
        hasManagerAccess={hasManagerAccess}
        selectedDate={selectedCalendarDate}
      />
    </div>
  );
};

export default DesktopCalendarView;
