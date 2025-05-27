
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { PlusCircle, Send } from 'lucide-react';
import { Schedule } from '@/hooks/use-schedules';
import { useIsMobile } from '@/hooks/use-mobile';
import { useScheduleCalendar } from '@/hooks/use-schedule-calendar';
import { useShiftAssignmentDialog } from '@/hooks/use-shift-assignment-dialog';
import { ShiftAssignmentDialog } from './ShiftAssignmentDialog';
import { OpenShiftType } from '@/types/supabase/schedules';
import ScheduleNotifications from './components/ScheduleNotifications';
import ScheduleList from './components/ScheduleList';
import { useToast } from '@/hooks/use-toast';
import AddShiftSheet from './components/AddShiftSheet';
import DateActionDialog from './components/DateActionDialog';
import { useOpenShifts } from '@/hooks/use-open-shifts';

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
  const { toast } = useToast();
  const { newSchedules, pendingSchedules } = useScheduleCalendar(schedules);
  const shiftAssignment = useShiftAssignmentDialog();
  const { openShifts, isLoading: openShiftsLoading } = useOpenShifts();
  
  const [isAddShiftOpen, setIsAddShiftOpen] = useState(false);
  const [isDateActionOpen, setIsDateActionOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleOpenShiftClick = (openShift: OpenShiftType) => {
    if (isAdmin || isHR) {
      shiftAssignment.openDialog(openShift);
    }
  };

  const handlePublishShifts = () => {
    const unpublishedShifts = schedules.filter(s => !s.published);
    
    if (unpublishedShifts.length === 0) {
      toast({
        title: "No unpublished shifts",
        description: "All shifts are already published to employees.",
        variant: "default"
      });
      return;
    }

    toast({
      title: "Publishing shifts",
      description: `Publishing ${unpublishedShifts.length} shifts to employees...`,
    });

    // TODO: Implement actual publishing logic with Supabase
    // This would typically update the published status and send notifications
  };

  const handleDateClick = (clickedDate: Date) => {
    if (isAdmin || isHR) {
      setSelectedDate(clickedDate);
      setIsDateActionOpen(true);
    }
  };

  const handleAddShift = () => {
    if (selectedDate) {
      setIsAddShiftOpen(true);
      setIsDateActionOpen(false);
    }
  };

  const handleSubmitShift = async (formData: any) => {
    try {
      toast({
        title: "Shift Published Successfully",
        description: "The shift has been created and is now available to employees.",
        variant: "default"
      });

      // Close the sheet
      setIsAddShiftOpen(false);
      
      // Refresh the parent component to show new shifts
      onAddSchedule();
      
    } catch (error) {
      console.error('Error creating shift:', error);
      toast({
        title: "Error",
        description: "Failed to create and publish shift. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <>
      <div className="bg-white rounded-3xl p-4 sm:p-6 card-shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-medium">Schedule Calendar</h2>
          
          {(isAdmin || isHR) && (
            <Button 
              onClick={handlePublishShifts}
              className="bg-green-600 hover:bg-green-700 text-white"
              size={isMobile ? "sm" : "default"}
            >
              <Send className="h-4 w-4 mr-2" />
              Publish Shifts
            </Button>
          )}
        </div>
        
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
          onDayClick={handleDateClick}
          className="w-full"
          disabled={false}
          classNames={{
            day_today: "bg-black text-white",
            day_selected: "bg-teampulse-accent text-black",
            cell: "text-center p-0 relative [&:has([aria-selected])]:bg-teampulse-accent/10 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 cursor-pointer hover:bg-gray-100",
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

      {/* Date Action Dialog */}
      <DateActionDialog
        isOpen={isDateActionOpen}
        onClose={() => setIsDateActionOpen(false)}
        selectedDate={selectedDate}
        onAddShift={handleAddShift}
      />

      {/* Add Shift Sheet */}
      <AddShiftSheet
        isOpen={isAddShiftOpen}
        onOpenChange={setIsAddShiftOpen}
        onSubmit={handleSubmitShift}
        currentDate={selectedDate || new Date()}
        isMobile={isMobile}
      />

      {/* Shift Assignment Dialog */}
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
