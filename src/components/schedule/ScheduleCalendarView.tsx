
import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { format, isBefore, startOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { PlusCircle, Send, Clock, RefreshCw } from 'lucide-react';
import { Schedule } from '@/hooks/use-schedules';
import { useIsMobile } from '@/hooks/use-mobile';
import { useScheduleCalendar } from '@/hooks/use-schedule-calendar';
import { useShiftAssignmentDialog } from '@/hooks/use-shift-assignment-dialog';
import { ShiftAssignmentDialog } from './ShiftAssignmentDialog';
import { OpenShiftType } from '@/types/supabase/schedules';
import { useToast } from '@/hooks/use-toast';
import AddShiftSheet from './components/AddShiftSheet';
import DateActionDialog from './components/DateActionDialog';
import ScheduleDateContextMenu from './components/ScheduleDateContextMenu';
import ScheduleDatePopover from './components/ScheduleDatePopover';
import { useShiftActions } from '@/hooks/use-shift-actions';
import { useOpenShifts } from '@/hooks/use-open-shifts';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import PendingShiftsSection from './components/PendingShiftsSection';

interface ScheduleCalendarViewProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  schedules: Schedule[];
  schedulesLoading: boolean;
  employeeNames: Record<string, string>;
  onAddSchedule: () => void;
  isAdmin: boolean;
  isHR: boolean;
  refreshSchedules?: () => void;
}

const ScheduleCalendarView: React.FC<ScheduleCalendarViewProps> = ({
  date,
  setDate,
  schedules,
  schedulesLoading,
  employeeNames,
  onAddSchedule,
  isAdmin,
  isHR,
  refreshSchedules
}) => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { user, isEmployee } = useAuth();
  const { newSchedules, pendingSchedules } = useScheduleCalendar(schedules);
  const shiftAssignment = useShiftAssignmentDialog();
  const { openShifts, isLoading: openShiftsLoading } = useOpenShifts();
  const shiftActions = useShiftActions();
  
  const [isAddShiftOpen, setIsAddShiftOpen] = useState(false);
  const [isDateActionOpen, setIsDateActionOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [animatingDate, setAnimatingDate] = useState<Date | null>(null);

  const isManager = isAdmin || isHR;
  
  // Set initial date to today if not set
  useEffect(() => {
    if (!date) {
      setDate(new Date());
    }
  }, [date, setDate]);

  // Filter pending schedules for the current user and exclude expired ones
  const today = startOfDay(new Date());
  const currentUserPendingSchedules = isEmployee ? 
    schedules.filter(schedule => {
      // Check if the schedule is pending and belongs to the current user
      const isPending = schedule.status === 'pending';
      const belongsToUser = schedule.employee_id; // We'll need to match this against current user's employee record
      
      // Check if the schedule is not expired (start time is today or in the future)
      const scheduleDate = startOfDay(new Date(schedule.start_time));
      const isNotExpired = !isBefore(scheduleDate, today);
      
      return isPending && belongsToUser && isNotExpired;
    }) : [];

  const pendingCount = currentUserPendingSchedules.length;

  const handleOpenShiftClick = (openShift: OpenShiftType) => {
    if (isManager) {
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
  };

  const handleDateClick = (clickedDate: Date) => {
    if (isManager) {
      setSelectedDate(clickedDate);
      setIsDateActionOpen(true);
    }
  };

  const handleAddShift = () => {
    if (selectedDate) {
      setIsAddShiftOpen(true);
      setIsDateActionOpen(false);
      
      setAnimatingDate(selectedDate);
      setTimeout(() => setAnimatingDate(null), 2000);
    }
  };

  const handleSubmitShift = async (formData: any) => {
    try {
      toast({
        title: "🎉 Shift Created Successfully",
        description: "The shift has been created and will appear in the Open Shifts section for employees to claim.",
        variant: "default"
      });

      setIsAddShiftOpen(false);
      
      if (selectedDate) {
        setAnimatingDate(selectedDate);
        setTimeout(() => setAnimatingDate(null), 3000);
      }
      
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

  const handleRefreshSchedules = () => {
    if (refreshSchedules) {
      refreshSchedules();
      toast({
        title: "Refreshed",
        description: "Schedule data has been refreshed.",
      });
    }
  };

  const handlePendingShiftResponse = () => {
    // Refresh schedules after a pending shift response
    if (refreshSchedules) {
      refreshSchedules();
    }
  };

  const renderDay = (day: Date) => {
    const daySchedules = schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.start_time);
      return format(scheduleDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
    });

    const hasSchedules = daySchedules.length > 0;
    const hasPendingSchedules = daySchedules.some(s => s.status === 'pending');
    const isAnimating = animatingDate && format(animatingDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');

    const dayContent = (
      <div className={`relative w-full h-full flex flex-col items-center justify-center p-1 min-h-[40px] ${
        hasSchedules ? 'font-semibold' : ''
      } ${isAnimating ? 'animate-pulse bg-green-100 rounded-lg' : ''}`}>
        <span className="text-sm">{format(day, 'd')}</span>
        {hasSchedules && (
          <div className="flex gap-0.5 mt-1">
            {daySchedules.slice(0, 3).map((schedule, i) => (
              <div 
                key={i} 
                className={`w-1.5 h-1.5 rounded-full ${
                  schedule.status === 'pending' ? 'bg-orange-500' : 'bg-blue-500'
                }`}
              ></div>
            ))}
            {daySchedules.length > 3 && (
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
            )}
          </div>
        )}
        {hasPendingSchedules && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
        )}
        {isAnimating && (
          <div className="absolute inset-0 bg-green-400/20 rounded-lg animate-ping"></div>
        )}
      </div>
    );

    if (!isManager) {
      return hasSchedules ? (
        <ScheduleDatePopover
          date={day}
          schedules={schedules}
          employeeNames={employeeNames}
        >
          {dayContent}
        </ScheduleDatePopover>
      ) : dayContent;
    }

    return (
      <ScheduleDatePopover
        date={day}
        schedules={schedules}
        employeeNames={employeeNames}
      >
        <ScheduleDateContextMenu
          date={day}
          schedules={schedules}
          isManager={isManager}
          onEditShift={shiftActions.handleEditShift}
          onAddShift={shiftActions.handleAddShift}
          onDeleteShift={shiftActions.handleDeleteShift}
        >
          {dayContent}
        </ScheduleDateContextMenu>
      </ScheduleDatePopover>
    );
  };

  const selectedDateSchedules = date ? schedules.filter(schedule => {
    const scheduleDate = new Date(schedule.start_time);
    return format(scheduleDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
  }) : [];
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Schedule</h1>
          <p className="text-sm text-gray-600 mt-1">
            {format(new Date(), 'MMMM yyyy')}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleRefreshSchedules}
            variant="outline"
            size={isMobile ? "sm" : "default"}
            className="rounded-xl"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          {isManager && (
            <Button 
              onClick={handlePublishShifts}
              className="bg-green-600 hover:bg-green-700 text-white rounded-xl"
              size={isMobile ? "sm" : "default"}
            >
              <Send className="h-4 w-4 mr-2" />
              Publish Shifts
            </Button>
          )}
        </div>
      </div>

      {/* Pending Shifts Section - Only show for employees with pending shifts */}
      {isEmployee && pendingCount > 0 && (
        <PendingShiftsSection 
          pendingShifts={currentUserPendingSchedules}
          onResponseComplete={handlePendingShiftResponse}
        />
      )}
      
      {/* Calendar Card */}
      <Card className="mb-6 overflow-hidden">
        <div className="p-6">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            onDayClick={handleDateClick}
            className="w-full"
            disabled={false}
            components={{
              Day: ({ date: dayDate }) => renderDay(dayDate)
            }}
            classNames={{
              day_today: "bg-gray-900 text-white font-semibold rounded-lg",
              day_selected: "bg-blue-500 text-white rounded-lg",
              cell: "text-center p-1 relative hover:bg-gray-100 rounded-lg transition-colors cursor-pointer",
              head_cell: "text-gray-500 text-sm font-medium w-full",
              nav_button: "h-8 w-8 bg-transparent p-0 hover:bg-gray-100 rounded-lg",
              caption: "text-lg font-semibold",
              root: "w-full",
              table: "w-full border-collapse",
              row: "flex w-full",
              month: "space-y-4",
            }}
          />
        </div>
      </Card>

      {/* Today's Schedule */}
      {date && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              {format(date, 'EEEE, MMMM d, yyyy')}
            </h3>
            
            {selectedDateSchedules.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No shifts scheduled for this day</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateSchedules.map(schedule => (
                  <div 
                    key={schedule.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-8 rounded-full ${
                        schedule.status === 'pending' ? 'bg-orange-500' : 'bg-blue-500'
                      }`}></div>
                      <div>
                        <p className="font-medium">
                          {employeeNames[schedule.employee_id] || 'Unknown Employee'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(schedule.start_time), 'h:mm a')} - {format(new Date(schedule.end_time), 'h:mm a')}
                        </p>
                        {schedule.title && (
                          <p className="text-sm text-gray-500">{schedule.title}</p>
                        )}
                      </div>
                    </div>
                    <Badge 
                      variant={schedule.status === 'pending' ? 'outline' : 'default'}
                      className={
                        schedule.status === 'pending' 
                          ? 'border-orange-300 text-orange-700 bg-orange-50' 
                          : schedule.status === 'employee_accepted' 
                            ? 'border-green-300 text-green-700 bg-green-50'
                            : schedule.status === 'employee_rejected'
                              ? 'border-red-300 text-red-700 bg-red-50'
                              : ''
                      }
                    >
                      {schedule.status === 'employee_accepted' ? 'Accepted' : 
                       schedule.status === 'employee_rejected' ? 'Rejected' : 
                       schedule.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Add Schedule Button */}
      {isManager && (
        <div className="mt-6 flex justify-center">
          <Button 
            variant="outline" 
            size="lg"
            className="rounded-xl hover:scale-105 transition-transform duration-200" 
            onClick={onAddSchedule}
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Add New Schedule
          </Button>
        </div>
      )}

      {/* Dialogs and Sheets */}
      <DateActionDialog
        isOpen={isDateActionOpen}
        onClose={() => setIsDateActionOpen(false)}
        selectedDate={selectedDate}
        onAddShift={handleAddShift}
      />

      <AddShiftSheet
        isOpen={isAddShiftOpen || shiftActions.isAddShiftOpen}
        onOpenChange={(open) => {
          setIsAddShiftOpen(open);
          if (!open) shiftActions.closeAddShiftDialog();
        }}
        onSubmit={handleSubmitShift}
        currentDate={selectedDate || shiftActions.selectedDate || new Date()}
        isMobile={isMobile}
      />

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
