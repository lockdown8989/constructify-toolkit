
import React from 'react';
import { Plus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ScheduleHeader from '@/components/restaurant/ScheduleHeader';
import MobileScheduleView from '@/components/schedule/MobileScheduleView';
import AddShiftDialog from '@/components/schedule/mobile/AddShiftDialog';
import SwapShiftDialog from '@/components/schedule/mobile/SwapShiftDialog';
import AddEmployeeShiftDialog from '@/components/schedule/components/AddEmployeeShiftDialog';
import ShiftCalendarToolbar from '@/components/schedule/components/ShiftCalendarToolbar';
import WeekNavigation from '@/components/schedule/components/WeekNavigation';
import { Employee } from '@/types/restaurant-schedule';
import { ShiftCalendarProps } from '../types/calendar-types';

const MobileCalendarView: React.FC<ShiftCalendarProps> = ({
  shiftState,
  handleSubmitters
}) => {
  const {
    isAdmin,
    isHR,
    isManager,
    schedules,
    selectedDate,
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
    handleToday,
    handleAddShift,
    handleShiftClick
  } = shiftState;
  
  const {
    handleAddShiftSubmit,
    handleSwapShiftSubmit,
    handleEmployeeShiftSubmit
  } = handleSubmitters;

  // Convert employees to the expected format with role and hourlyRate
  const employees: Employee[] = shiftState.employees.map(emp => ({
    id: emp.id,
    name: emp.name,
    role: emp.job_title || 'Employee',
    hourlyRate: emp.hourly_rate || 0,
    avatarUrl: emp.avatar
  }));

  // Check if the current user has manager access
  const hasManagerAccess = isAdmin || isManager || isHR;

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <ScheduleHeader 
        locationName={locationName} 
        setLocationName={setLocationName}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        weekView={weekView}
        setWeekView={setWeekView}
      />
      
      {/* Week navigation for better mobile experience */}
      <div className="px-2 py-3 border-b">
        <WeekNavigation
          currentDate={selectedDate}
          onPreviousWeek={() => shiftState.handlePreviousWeek()}
          onNextWeek={() => shiftState.handleNextWeek()}
          onSelectToday={handleToday}
          isMobile={true}
          viewType={weekView ? 'week' : 'day'}
        />
      </div>
      
      <MobileScheduleView 
        schedules={schedules}
        employees={employees}
        onAddShift={() => handleAddShift(new Date())}
        onShiftClick={handleShiftClick}
        selectedDate={selectedDate}
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
      {hasManagerAccess && (
        <Button
          onClick={() => handleAddShift(new Date())}
          className="fixed bottom-20 right-6 z-50 h-14 w-14 rounded-full shadow-lg bg-blue-500 hover:bg-blue-600 p-0 flex items-center justify-center"
          aria-label="Add shift"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
};

export default MobileCalendarView;
