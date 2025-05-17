
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
    selectedEmployee,
    setSelectedEmployee,
    selectedShift,
    setSelectedShift,
    employees,
    isMobile,
    allEmployeeSchedules,
    handleNextPeriod,
    handlePreviousPeriod,
    handleToday,
    handleAddShift,
    handleSwapShift,
    handleSubmitAddShift,
    handleSubmitSwapShift,
    handleShiftClick,
    handleEmployeeAddShift
  } = useShiftCalendarState();

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
          handleSubmit={handleSubmitAddShift}
        />
        
        {/* Mobile Swap Shift Sheet */}
        <SwapShiftDialog
          isOpen={isSwapShiftOpen}
          onOpenChange={setIsSwapShiftOpen}
          selectedDay={selectedDay}
          employees={employees}
          selectedEmployee={selectedEmployee}
          setSelectedEmployee={setSelectedEmployee}
          handleSubmit={handleSubmitSwapShift}
          schedules={schedules}
          selectedShift={selectedShift}
          setSelectedShift={setSelectedShift}
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
      <DateControls
        selectedDate={selectedDate}
        weekView={weekView}
        setWeekView={setWeekView}
        handlePreviousPeriod={handlePreviousPeriod}
        handleNextPeriod={handleNextPeriod}
        handleToday={handleToday}
        onAddShift={() => handleAddShift(new Date())}
      />
      
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
            handleEmployeeAddShift={handleEmployeeAddShift}
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
        handleSubmit={handleSubmitAddShift}
      />
      
      {/* Desktop popover for Swap Shift */}
      <SwapShiftPopover
        isOpen={isSwapShiftOpen && !isMobile}
        onOpenChange={setIsSwapShiftOpen}
        selectedDay={selectedDay}
        employees={employees}
        selectedEmployee={selectedEmployee}
        setSelectedEmployee={setSelectedEmployee}
        handleSubmit={handleSubmitSwapShift}
        schedules={schedules}
        selectedShift={selectedShift}
        setSelectedShift={setSelectedShift}
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
