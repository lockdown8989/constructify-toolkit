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
import { ShiftCalendarProps } from '../types/calendar-types';
import DateActionMenu from '../calendar/DateActionMenu';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const DesktopCalendarView: React.FC<ShiftCalendarProps> = ({
  shiftState,
  handleSubmitters
}) => {
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null);
  const { toast } = useToast();
  
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
    role: emp.job_title || 'Employee',
    hourlyRate: emp.hourly_rate || 0,
    avatarUrl: emp.avatar
  }));

  // Check if the current user has manager access
  const hasManagerAccess = shiftState.isAdmin || shiftState.isManager || shiftState.isHR;

  // Handle date cell click to open menu
  const handleDateCellClick = (date: Date) => {
    console.log('Date cell clicked:', date);
    setSelectedCalendarDate(date);
    setIsDateMenuOpen(true);
  };

  // Handle add shift from mini menu with Supabase integration
  const handleAddShiftFromMenu = async () => {
    if (selectedCalendarDate) {
      console.log('Adding shift from menu for date:', selectedCalendarDate);
      try {
        // Log the action in Supabase
        await supabase.from('calendar_actions').insert({
          action_type: 'add_shift',
          date: selectedCalendarDate.toISOString(),
          platform: 'desktop',
          initiated_by: (await supabase.auth.getUser()).data.user?.id
        });
        
        // Close the menu first to avoid issues
        setIsDateMenuOpen(false);
        
        // Then proceed with the normal flow
        setTimeout(() => {
          shiftState.handleAddShift(selectedCalendarDate);
          toast({
            title: "Opening add shift dialog",
            description: `Adding shift for ${format(selectedCalendarDate, 'MMMM d, yyyy')}`,
          });
        }, 100);
      } catch (error) {
        console.error('Error logging calendar action:', error);
        // Close the menu
        setIsDateMenuOpen(false);
        
        // Continue with the action anyway
        setTimeout(() => {
          shiftState.handleAddShift(selectedCalendarDate);
        }, 100);
      }
    }
  };

  // Handle add employee shift from mini menu with Supabase integration
  const handleAddEmployeeFromMenu = async () => {
    if (selectedCalendarDate) {
      console.log('Adding employee shift from menu for date:', selectedCalendarDate);
      try {
        // Log the action in Supabase
        await supabase.from('calendar_actions').insert({
          action_type: 'add_employee_shift',
          date: selectedCalendarDate.toISOString(),
          platform: 'desktop',
          initiated_by: (await supabase.auth.getUser()).data.user?.id
        });
        
        // Also add notification for managers about this action
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          const { data: employeeData } = await supabase
            .from('employees')
            .select('name')
            .eq('user_id', userData.user.id)
            .maybeSingle();
            
          const managerName = employeeData?.name || 'A manager';
          const dateString = format(selectedCalendarDate, 'MMMM d, yyyy');
          
          // Notify other managers
          await supabase.from('notifications').insert({
            user_id: userData.user.id,
            title: 'Calendar Action',
            message: `${managerName} initiated adding an employee shift on ${dateString}`,
            type: 'info',
            related_entity: 'calendar',
            related_id: selectedCalendarDate.toISOString()
          });
        }
        
        // Close the menu first
        setIsDateMenuOpen(false);
        
        // Then proceed with the normal flow
        setTimeout(() => {
          shiftState.handleAddEmployeeShift(selectedCalendarDate);
          toast({
            title: "Opening add employee shift dialog",
            description: `Adding employee shift for ${format(selectedCalendarDate, 'MMMM d, yyyy')}`,
          });
        }, 100);
      } catch (error) {
        console.error('Error logging calendar action:', error);
        // Close the menu
        setIsDateMenuOpen(false);
        
        // Continue with the action anyway
        setTimeout(() => {
          shiftState.handleAddEmployeeShift(selectedCalendarDate);
        }, 100);
      }
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
