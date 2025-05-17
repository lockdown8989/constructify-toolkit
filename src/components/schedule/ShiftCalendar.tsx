
import React from 'react';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ScheduleHeader from '@/components/restaurant/ScheduleHeader';
import MobileScheduleView from './MobileScheduleView';
import { useShiftCalendarState } from './hooks/useShiftCalendarState';
import DayColumns from './calendar/DayColumns';
import CalendarGrid from './calendar/CalendarGrid';
import DateControls from './calendar/DateControls';
import CalendarFooter from './calendar/CalendarFooter';
import AddShiftDialog from './mobile/AddShiftDialog';
import SwapShiftDialog from './mobile/SwapShiftDialog';
import AddShiftPopover from './desktop/AddShiftPopover';
import SwapShiftPopover from './desktop/SwapShiftPopover';
import AddShiftFAB from './calendar/AddShiftFAB';
import AddEmployeeShiftDialog from './components/AddEmployeeShiftDialog';
import ShiftCalendarToolbar from './components/ShiftCalendarToolbar';
import { Employee } from '@/types/restaurant-schedule';

const ShiftCalendar = () => {
  const {
    isAdmin,
    isHR,
    isManager,
    schedules,
    isLoading,
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
    employees: employeesData,
    isMobile,
    allEmployeeSchedules,
    handleNextPeriod,
    handlePreviousPeriod,
    handleToday,
    handleAddShift,
    handleSwapShift,
    handleAddEmployeeShift,
    handleSubmitAddShift,
    handleSubmitEmployeeShift,
    handleSubmitSwapShift,
    handleShiftClick
  } = useShiftCalendarState();

  // Convert employees to the expected format with role and hourlyRate
  const employees: Employee[] = employeesData.map(emp => ({
    id: emp.id,
    name: emp.name,
    role: emp.job_title || 'Employee', // Use job_title as role or default to 'Employee'
    hourlyRate: emp.hourly_rate || 0,
    avatarUrl: emp.avatar
  }));

  // Check if the current user has manager access
  const hasManagerAccess = isAdmin || isManager || isHR;

  // Create wrapper functions to handle the callbacks without returning promises
  const handleAddShiftSubmit = (formData: any) => {
    handleSubmitAddShift(formData);
  };
  
  const handleSwapShiftSubmit = (formData: any) => {
    handleSubmitSwapShift(formData);
  };
  
  const handleEmployeeShiftSubmit = (formData: any) => {
    handleSubmitEmployeeShift(formData);
  };
  
  // Wrapper for handleAddEmployeeShift to adapt to expected signature
  const handleEmployeeShiftAdd = (employeeId: string, date: Date) => {
    handleAddEmployeeShift(date);
  };

  // If on mobile, render the mobile schedule view
  if (isMobile) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <ScheduleHeader 
          locationName={locationName} 
          setLocationName={setLocationName}
          onSearch={setSearchQuery}
          searchQuery={searchQuery}
          weekView={weekView}
          setWeekView={setWeekView}
        />
        <div className="flex justify-between items-center p-4 border-b">
          <ShiftCalendarToolbar
            currentDate={selectedDate}
            onDateChange={date => handleToday()}
            onAddShift={() => handleAddShift(new Date())}
            onAddEmployeeShift={() => hasManagerAccess && handleAddEmployeeShift(new Date())}
          />
        </div>
        <MobileScheduleView 
          schedules={schedules}
          employees={employees}
          onAddShift={() => handleAddShift(new Date())}
          onShiftClick={handleShiftClick}
        />
        
        {/* Mobile Add Shift Sheet */}
        <AddShiftDialog
          isOpen={isAddShiftOpen}
          onOpenChange={setIsAddShiftOpen}
          selectedDay={selectedDay}
          employees={employees}
          selectedEmployee={selectedEmployee}
          setSelectedEmployee={setSelectedEmployee}
          handleSubmit={handleAddShiftSubmit}
        />
        
        {/* Mobile Swap Shift Sheet */}
        <SwapShiftDialog
          isOpen={isSwapShiftOpen}
          onOpenChange={setIsSwapShiftOpen}
          selectedDay={selectedDay}
          employees={employees}
          selectedEmployee={selectedEmployee}
          setSelectedEmployee={setSelectedEmployee}
          handleSubmit={handleSwapShiftSubmit}
          schedules={schedules}
          selectedShift={selectedShift}
          setSelectedShift={setSelectedShift}
        />

        {/* Mobile Add Employee Shift Dialog */}
        <AddEmployeeShiftDialog
          isOpen={isAddEmployeeShiftOpen}
          onOpenChange={setIsAddEmployeeShiftOpen}
          selectedDay={selectedDay}
          employees={employees}
          selectedEmployee={selectedEmployee}
          setSelectedEmployee={setSelectedEmployee}
          handleSubmit={handleEmployeeShiftSubmit}
        />

        {/* FAB for mobile view - positioned at bottom right */}
        {(isAdmin || isManager || isHR) && (
          <Button
            onClick={() => handleAddShift(new Date())}
            className="fixed bottom-20 right-6 z-50 h-14 w-14 rounded-full shadow-lg bg-blue-500 hover:bg-blue-600 p-0 flex items-center justify-center"
          >
            <Plus className="h-6 w-6" />
          </Button>
        )}
      </div>
    );
  }

  // Desktop view
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
                <Plus className="h-4 w-4 mr-1" />
                Add Shift
              </Button>
              <Button
                onClick={() => handleAddEmployeeShift(selectedDate)}
                variant="default"
                size="sm"
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <Plus className="h-4 w-4 mr-1" />
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
            handleEmployeeAddShift={handleEmployeeShiftAdd}
            isLoading={isLoading}
          />
        </div>
      </div>
      
      {/* Display information about schedule updates */}
      <CalendarFooter />
      
      {/* Desktop popover for Add Shift */}
      <AddShiftPopover
        isOpen={isAddShiftOpen && !isMobile}
        onOpenChange={setIsAddShiftOpen}
        selectedDay={selectedDay}
        employees={employees}
        selectedEmployee={selectedEmployee}
        setSelectedEmployee={setSelectedEmployee}
        handleSubmit={handleAddShiftSubmit}
      />
      
      {/* Desktop popover for Swap Shift */}
      <SwapShiftPopover
        isOpen={isSwapShiftOpen && !isMobile}
        onOpenChange={setIsSwapShiftOpen}
        selectedDay={selectedDay}
        employees={employees}
        selectedEmployee={selectedEmployee}
        setSelectedEmployee={setSelectedEmployee}
        handleSubmit={handleSwapShiftSubmit}
        schedules={schedules}
        selectedShift={selectedShift}
        setSelectedShift={setSelectedShift}
      />
      
      {/* Desktop dialog for Add Employee Shift */}
      <AddEmployeeShiftDialog
        isOpen={isAddEmployeeShiftOpen && !isMobile}
        onOpenChange={setIsAddEmployeeShiftOpen}
        selectedDay={selectedDay}
        employees={employees}
        selectedEmployee={selectedEmployee}
        setSelectedEmployee={setSelectedEmployee}
        handleSubmit={handleEmployeeShiftSubmit}
      />
      
      {/* FAB for desktop view - positioned at bottom right */}
      <AddShiftFAB
        onClick={() => handleAddShift(new Date())}
        isVisible={isAdmin || isManager || isHR}
      />
    </div>
  );
};

export default ShiftCalendar;
