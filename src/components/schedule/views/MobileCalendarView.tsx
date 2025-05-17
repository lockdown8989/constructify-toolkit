
import React, { useState } from 'react';
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
import DateActionMenu from '../calendar/DateActionMenu';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const MobileCalendarView: React.FC<ShiftCalendarProps> = ({
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
    handleShiftClick,
    handleNextPeriod,
    handlePreviousPeriod
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
          platform: 'mobile',
          initiated_by: (await supabase.auth.getUser()).data.user?.id
        });
        
        // Close the menu first
        setIsDateMenuOpen(false);
        
        // Then proceed with the normal flow to avoid state issues
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
          platform: 'mobile',
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
          onPreviousWeek={handlePreviousPeriod}
          onNextWeek={handleNextPeriod}
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
        onDateClick={handleDateCellClick}
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

      {/* Date Action Menu */}
      <DateActionMenu 
        isOpen={isDateMenuOpen}
        onClose={() => setIsDateMenuOpen(false)}
        onAddShift={handleAddShiftFromMenu}
        onAddEmployee={handleAddEmployeeFromMenu}
        hasManagerAccess={hasManagerAccess}
        selectedDate={selectedCalendarDate}
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
