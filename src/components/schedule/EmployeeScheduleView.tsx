
import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays } from 'date-fns';
import { useEmployeeSchedule } from '@/hooks/use-employee-schedule';
import { Check, ChevronLeft, ChevronRight, RefreshCw, ArrowLeft } from 'lucide-react';
import WeeklyCalendarView from '@/components/schedule/WeeklyCalendarView';
import { ScheduleDialogs } from './components/ScheduleDialogs';
import { ScheduleTabs } from './components/ScheduleTabs';
import { Schedule } from '@/hooks/use-schedules';
import { Button } from '@/components/ui/button';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { OpenShiftType } from '@/types/supabase/schedules';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import ViewSelector, { ViewType } from './components/ViewSelector';
import MonthlyView from './views/MonthlyView';
import DailyView from './views/DailyView';
import { useCalendarPreferences } from '@/hooks/use-calendar-preferences';
import DateActionMenu from './calendar/DateActionMenu';

const EmployeeScheduleView: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, isHR, isManager } = useAuth();
  const hasManagerAccess = isAdmin || isHR || isManager;
  
  const {
    currentDate,
    setCurrentDate,
    selectedScheduleId,
    setSelectedScheduleId,
    isInfoDialogOpen,
    setIsInfoDialogOpen,
    isCancelDialogOpen,
    setIsCancelDialogOpen,
    activeTab,
    setActiveTab,
    newSchedules,
    schedules,
    isLoading,
    refreshSchedules
  } = useEmployeeSchedule();

  // Get calendar preferences
  const { preferences, setDefaultView } = useCalendarPreferences();
  
  // State to track if a shift was just dropped
  const [droppedShiftId, setDroppedShiftId] = useState<string | null>(null);
  const [openShifts, setOpenShifts] = useState<OpenShiftType[]>([]);
  const [isAddShiftDialogOpen, setIsAddShiftDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [viewType, setViewType] = useState<ViewType>('week');
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
  
  // Check location state for view preference
  useEffect(() => {
    if (location.state?.view) {
      setViewType(location.state.view);
    } else if (preferences?.default_view) {
      setViewType(preferences.default_view);
    }
    
    if (location.state?.selectedDate) {
      setCurrentDate(new Date(location.state.selectedDate));
    }
  }, [location.state, preferences]);
  
  // When view type changes, save it as preference
  useEffect(() => {
    if (viewType && preferences) {
      setDefaultView(viewType);
    }
  }, [viewType, setDefaultView]);
  
  // Fetch open shifts that can be dropped
  useEffect(() => {
    const fetchOpenShifts = async () => {
      try {
        const { data, error } = await supabase
          .from('open_shifts')
          .select('*')
          .eq('status', 'open')
          .order('start_time', { ascending: true });
          
        if (error) {
          console.error('Error fetching open shifts:', error);
          return;
        }
        
        setOpenShifts(data || []);
      } catch (error) {
        console.error('Error in open shifts fetch:', error);
      }
    };
    
    fetchOpenShifts();
  }, []);

  const handleNavigateBack = () => {
    navigate('/employee-workflow');
  };

  const handleEmailClick = (schedule: Schedule) => {
    const subject = `Regarding shift on ${format(new Date(schedule.start_time), 'MMMM d, yyyy')}`;
    const body = `Hello,\n\nI would like to discuss my shift scheduled for ${format(new Date(schedule.start_time), 'MMMM d, yyyy')} from ${format(new Date(schedule.start_time), 'h:mm a')} to ${format(new Date(schedule.end_time), 'h:mm a')}.`;
    window.location.href = `mailto:manager@workplace.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleResponseComplete = () => {
    // Refresh schedules data after a response
    refreshSchedules();
    
    // If we were in the pending tab and there are no more pending shifts,
    // switch to the my-shifts tab
    if (activeTab === 'pending') {
      const pendingShifts = schedules.filter(s => s.status === 'pending');
      if (pendingShifts.length <= 1) { // Using <= 1 because the current item is still in the array
        setActiveTab('my-shifts');
      }
    }
  };
  
  // Handle View Type Changes
  const handleViewChange = (view: ViewType) => {
    setViewType(view);
  };
  
  // Function for add shift functionality
  const handleAddShift = (day: Date) => {
    if (hasManagerAccess) {
      setSelectedDay(day);
      navigate('/shift-calendar', { state: { selectedDate: day } });
    }
  };

  // Function for add employee shift functionality
  const handleAddEmployeeShift = (day: Date) => {
    if (hasManagerAccess) {
      setSelectedDay(day);
      navigate('/shift-calendar', { state: { selectedDate: day, addEmployeeShift: true } });
    }
  };
  
  // Function to handle shift drag start
  const handleShiftDragStart = (e: React.DragEvent, shift: OpenShiftType) => {
    // Set the data to be transferred
    e.dataTransfer.setData('shiftId', shift.id);
    e.dataTransfer.effectAllowed = 'move';
  };
  
  // Function to handle shift drag end
  const handleShiftDragEnd = () => {
    // Reset any drag-related UI states if needed
  };

  // Function to handle shift drops
  const handleShiftDrop = async (shiftId: string) => {
    try {
      // Get employee ID for the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication error",
          description: "Please log in to claim shifts.",
          variant: "destructive"
        });
        return;
      }
      
      const { data: employeeData } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .single();
        
      if (!employeeData) {
        toast({
          title: "Employee record not found",
          description: "Could not find your employee record.",
          variant: "destructive"
        });
        return;
      }
      
      // Create an assignment record
      const { data, error } = await supabase
        .from('open_shift_assignments')
        .insert([{
          open_shift_id: shiftId,
          employee_id: employeeData.id,
          status: 'confirmed'
        }])
        .select()
        .single();
        
      if (error) {
        console.error('Error assigning shift:', error);
        toast({
          title: "Error",
          description: "Failed to assign the shift. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      // Update the open shift status
      await supabase
        .from('open_shifts')
        .update({ status: 'assigned' })
        .eq('id', shiftId);
        
      // Set the dropped shift ID to highlight it
      setDroppedShiftId(shiftId);
      
      toast({
        title: "Shift assigned",
        description: "The shift has been added to your schedule.",
      });
      
      // Refresh schedules to show the new shift
      refreshSchedules();
      
      // Also refresh open shifts
      const { data: updatedOpenShifts } = await supabase
        .from('open_shifts')
        .select('*')
        .eq('status', 'open')
        .order('start_time', { ascending: true });
        
      if (updatedOpenShifts) {
        setOpenShifts(updatedOpenShifts);
      }
      
    } catch (error) {
      console.error('Error in shift assignment:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Function to handle date click from calendar views
  const handleDateClick = (date: Date) => {
    setCurrentDate(date);
    setIsDateMenuOpen(true);
  };

  // Function to handle previous/next navigation
  const handleDateNavigation = (increment: number) => {
    const newDate = new Date(currentDate);
    if (viewType === 'month') {
      newDate.setMonth(newDate.getMonth() + increment);
    } else if (viewType === 'week') {
      newDate.setDate(newDate.getDate() + (increment * 7));
    } else {
      newDate.setDate(newDate.getDate() + increment);
    }
    setCurrentDate(newDate);
  };

  const selectedSchedule = selectedScheduleId 
    ? schedules.find(s => s.id === selectedScheduleId) 
    : null;

  if (isLoading) {
    return <div className="p-4 text-center">Loading schedule...</div>;
  }

  return (
    <div className="pb-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center px-4 pt-2 pb-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleNavigateBack}
            className="flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <h2 className="text-xl font-semibold">Your Schedule</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshSchedules}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>
      
      {/* Calendar Controls */}
      <div className="flex flex-wrap justify-between items-center px-4 mb-4 gap-y-2">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleDateNavigation(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="text-sm font-medium">
            {viewType === 'month' 
              ? format(currentDate, 'MMMM yyyy')
              : viewType === 'week'
                ? `Week of ${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d, yyyy')}`
                : format(currentDate, 'EEEE, MMMM d, yyyy')
            }
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleDateNavigation(1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
        </div>
        
        <ViewSelector view={viewType} onChange={handleViewChange} />
      </div>
      
      {/* Calendar View based on selected view type */}
      <div className="px-4">
        {viewType === 'month' ? (
          <MonthlyView 
            currentDate={currentDate} 
            schedules={schedules} 
            onDateClick={handleDateClick}
          />
        ) : viewType === 'week' ? (
          <WeeklyCalendarView
            startDate={currentDate}
            onDateChange={setCurrentDate}
            schedules={schedules}
            onShiftDrop={handleShiftDrop}
            highlightedShiftId={droppedShiftId}
            onAddShift={handleAddShift}
            onAddEmployeeShift={handleAddEmployeeShift}
          />
        ) : (
          <DailyView 
            date={currentDate}
            schedules={schedules}
            onShiftClick={(shift) => {
              setSelectedScheduleId(shift.id);
              setIsInfoDialogOpen(true);
            }}
            onDateClick={handleDateClick}
          />
        )}
      </div>
      
      <div className="border-t border-gray-200 my-4" />

      <ScheduleTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        schedules={schedules}
        newSchedules={newSchedules}
        onInfoClick={setSelectedScheduleId}
        onEmailClick={handleEmailClick}
        onCancelClick={(id) => {
          setSelectedScheduleId(id);
          setIsCancelDialogOpen(true);
        }}
        onResponseComplete={handleResponseComplete}
      />

      <ScheduleDialogs
        selectedSchedule={selectedSchedule}
        isInfoDialogOpen={isInfoDialogOpen}
        setIsInfoDialogOpen={setIsInfoDialogOpen}
        isCancelDialogOpen={isCancelDialogOpen}
        setIsCancelDialogOpen={setIsCancelDialogOpen}
      />

      {/* Date Action Menu */}
      <DateActionMenu
        isOpen={isDateMenuOpen}
        onClose={() => setIsDateMenuOpen(false)}
        onAddShift={() => selectedDay && handleAddShift(selectedDay)}
        onAddEmployee={() => selectedDay && handleAddEmployeeShift(selectedDay)}
        hasManagerAccess={hasManagerAccess}
        selectedDate={selectedDay || undefined}
      />
    </div>
  );
};

export default EmployeeScheduleView;
