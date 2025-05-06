
import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Schedule } from '@/hooks/use-schedules';
import { useIsMobile } from '@/hooks/use-mobile';
import { useScheduleCalendar } from '@/hooks/use-schedule-calendar';
import { useShiftAssignmentDialog } from '@/hooks/use-shift-assignment-dialog';
import { ShiftAssignmentDialog } from './ShiftAssignmentDialog';
import { OpenShiftType } from '@/types/supabase/schedules';
import ScheduleNotifications from './components/ScheduleNotifications';
import ScheduleList from './components/ScheduleList';

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
  const { newSchedules, pendingSchedules } = useScheduleCalendar(schedules);
  const shiftAssignment = useShiftAssignmentDialog();

  const handleOpenShiftClick = (openShift: OpenShiftType) => {
    if (isAdmin || isHR) {
      shiftAssignment.openDialog(openShift);
    }
  };
  
  return (
    <>
      <div className="bg-white rounded-3xl p-4 sm:p-6 card-shadow">
        <h2 className="text-lg sm:text-xl font-medium mb-4">Company Calendar</h2>
        
        <ScheduleNotifications 
          newSchedules={Object.keys(newSchedules).map(id => 
            schedules.find(s => s.id === id)
          ).filter(Boolean) as Schedule[]}
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
        />
        
        {(isAdmin || isHR) && (
          <Button 
            variant="outline" 
            size={isMobile ? "sm" : "default"} 
            className="mt-4 w-full sm:w-auto" 
            onClick={onAddSchedule}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Schedule
          </Button>
        )}
      </div>

      {/* Add ShiftAssignmentDialog */}
      <ShiftAssignmentDialog
        isOpen={shiftAssignment.isOpen}
        onClose={shiftAssignment.closeDialog}
        shift={shiftAssignment.selectedShift}
        employees={shiftAssignment.employees || []}
        onAssign={shiftAssignment.handleAssign}
      />
    </>
  );
};

export default ScheduleCalendarView;
