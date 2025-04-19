
import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Schedule } from '@/hooks/use-schedules';
import { useIsMobile } from '@/hooks/use-mobile';
import { useShiftAssignmentDialog } from '@/hooks/use-shift-assignment-dialog';
import { ShiftAssignmentDialog } from './ShiftAssignmentDialog';
import { OpenShiftType } from '@/types/supabase/schedules';
import CalendarNotifications from './calendar/CalendarNotifications';
import ScheduleList from './calendar/ScheduleList';

interface ScheduleCalendarViewProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  schedules: Schedule[];
  schedulesLoading: boolean;
  employeeNames: Record<string, string>;
  onAddSchedule: () => void;
  isAdmin: boolean;
  isHR: boolean;
}

const ScheduleCalendarView: React.FC<ScheduleCalendarViewProps> = ({
  date,
  setDate,
  schedules,
  schedulesLoading,
  employeeNames,
  onAddSchedule,
  isAdmin,
  isHR
}) => {
  const isMobile = useIsMobile();
  const [newSchedules, setNewSchedules] = useState<Schedule[]>([]);
  const [pendingSchedules, setPendingSchedules] = useState<Schedule[]>([]);
  
  // Identify new and pending schedules
  useEffect(() => {
    if (!schedules.length) return;
    
    const now = new Date();
    
    // Find recent schedules (within the last 24 hours)
    const recentSchedules = schedules.filter(schedule => {
      const createdAt = new Date(schedule.created_at || schedule.start_time);
      const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
      return hoursSinceCreation < 24;
    });
    
    // Find pending schedules
    const pendingSchedulesList = schedules.filter(schedule => 
      schedule.status === 'pending'
    );
    
    setNewSchedules(recentSchedules);
    setPendingSchedules(pendingSchedulesList);
  }, [schedules]);
  
  const shiftAssignment = useShiftAssignmentDialog();

  const handleOpenShiftClick = (openShift: OpenShiftType) => {
    if (isAdmin || isHR) {
      shiftAssignment.openDialog(openShift);
    }
  };
  
  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 card-shadow">
      <h2 className="text-lg sm:text-xl font-medium mb-4">Company Calendar</h2>
      
      <CalendarNotifications 
        newSchedules={newSchedules} 
        pendingSchedules={pendingSchedules} 
      />
      
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="w-full"
        disabled={false}
        classNames={{
          day_today: "bg-black text-white",
          day_selected: "bg-teampulse-accent text-black",
          cell: "text-center p-0 relative [&:has([aria-selected])]:bg-teampulse-accent/10 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          head_cell: "text-gray-500 text-xs sm:text-sm w-9 font-normal",
          nav_button: "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100",
          caption: "text-sm sm:text-base",
          root: "w-full",
          table: "w-full border-collapse space-y-1",
          row: "flex w-full mt-2",
        }}
      />
      
      <ScheduleList
        date={date}
        schedules={schedules}
        schedulesLoading={schedulesLoading}
        employeeNames={employeeNames}
        newSchedules={newSchedules}
        onAddSchedule={onAddSchedule}
        isAdmin={isAdmin}
        isHR={isHR}
        isMobile={isMobile}
      />

      {/* Add ShiftAssignmentDialog */}
      <ShiftAssignmentDialog
        isOpen={shiftAssignment.isOpen}
        onClose={shiftAssignment.closeDialog}
        shift={shiftAssignment.selectedShift}
        employees={shiftAssignment.employees || []}
        onAssign={shiftAssignment.handleAssign}
      />
    </div>
  );
};

export default ScheduleCalendarView;
