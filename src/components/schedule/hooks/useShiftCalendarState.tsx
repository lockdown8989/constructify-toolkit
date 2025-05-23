import { useState, useEffect } from 'react';
import { addDays, format, subDays, startOfDay, endOfDay, addMonths, subMonths } from 'date-fns';
import { useSchedules } from '@/hooks/use-schedules';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useEmployees } from '@/hooks/use-employees';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { createShiftAssignment } from '@/utils/calendar-actions';

export const useShiftCalendarState = () => {
  // Keep existing state properties
  const { user, isAdmin, isHR, isManager } = useAuth();
  const { data: schedules = [], isLoading, refetch } = useSchedules();
  const { data: employees = [] } = useEmployees({});
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  // State for calendar view
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekView, setWeekView] = useState(true);
  const [visibleDays, setVisibleDays] = useState<Date[]>([]);
  const [locationName, setLocationName] = useState('Main Location');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Month and year state
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  
  // State for shift management
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [isAddShiftOpen, setIsAddShiftOpen] = useState(false);
  const [isSwapShiftOpen, setIsSwapShiftOpen] = useState(false);
  const [isAddEmployeeShiftOpen, setIsAddEmployeeShiftOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [selectedShift, setSelectedShift] = useState<any | null>(null);
  
  // Keep existing useEffect for updating visible days and month/year syncing
  useEffect(() => {
    const days = [];
    const dayCount = weekView ? 7 : 1;
    const startDay = weekView ? subDays(selectedDate, selectedDate.getDay() - 1) : selectedDate;
    
    for (let i = 0; i < dayCount; i++) {
      days.push(addDays(startDay, i));
    }
    
    setVisibleDays(days);
  }, [selectedDate, weekView]);

  // Sync month and year with selected date
  useEffect(() => {
    setMonth(selectedDate.getMonth());
    setYear(selectedDate.getFullYear());
  }, [selectedDate]);

  // Filter schedules based on visible days
  const filteredSchedules = schedules.filter(schedule => {
    const scheduleDate = new Date(schedule.start_time);
    
    // Filter by visible days
    const isVisible = visibleDays.some(day => 
      scheduleDate.getDate() === day.getDate() && 
      scheduleDate.getMonth() === day.getMonth() && 
      scheduleDate.getFullYear() === day.getFullYear()
    );
    
    return isVisible;
  });

  // Group schedules by employee
  const allEmployeeSchedules = employees.map(employee => {
    const employeeSchedules = filteredSchedules.filter(schedule => 
      schedule.employee_id === employee.id
    );
    
    return {
      employee,
      schedules: employeeSchedules
    };
  });

  // Calendar navigation functions - keep existing methods
  const handleNextPeriod = () => {
    setSelectedDate(prevDate => addDays(prevDate, weekView ? 7 : 1));
  };

  const handlePreviousPeriod = () => {
    setSelectedDate(prevDate => subDays(prevDate, weekView ? 7 : 1));
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  // Month navigation functions - keep existing methods
  const handleNextMonth = () => {
    const newDate = addMonths(new Date(year, month), 1);
    setMonth(newDate.getMonth());
    setYear(newDate.getFullYear());
    setSelectedDate(newDate);
  };

  const handlePrevMonth = () => {
    const newDate = subMonths(new Date(year, month), 1);
    setMonth(newDate.getMonth());
    setYear(newDate.getFullYear());
    setSelectedDate(newDate);
  };

  // Updated Shift management functions
  const handleAddShift = (day: Date) => {
    console.log(`Opening add shift dialog for date: ${format(day, 'yyyy-MM-dd')}`);
    // Record this action for analytics
    recordCalendarAction('open_add_shift_dialog', day);
    
    // First set the selected day
    setSelectedDay(day);
    
    // Then set the dialog to open state
    setIsAddShiftOpen(true);
    
    // Log after state updates to verify
    setTimeout(() => {
      console.log('Dialog state after update:', {
        isOpen: isAddShiftOpen,
        selectedDay: day.toISOString()
      });
    }, 100);
    
    toast({
      title: "Add shift",
      description: `Adding shift for ${format(day, 'EEEE, MMM d')}`,
    });
  };

  const handleSwapShift = (day: Date) => {
    setSelectedDay(day);
    setIsSwapShiftOpen(true);
  };

  const handleAddEmployeeShift = (day: Date) => {
    setSelectedDay(day);
    setIsAddEmployeeShiftOpen(true);
    if (employees.length > 0) {
      setSelectedEmployee(employees[0].id);
    }
  };

  // Updated handler for adding shift to a specific employee
  const handleEmployeeAddShift = (employeeId: string, date: Date) => {
    console.log(`handleEmployeeAddShift called for employee ${employeeId} on date ${format(date, 'yyyy-MM-dd')}`);
    
    toast({
      title: "Adding shift",
      description: `Adding shift for employee on ${format(date, 'MMM d')}`,
    });
    
    // First set the employee and day
    setSelectedEmployee(employeeId);
    setSelectedDay(date);
    
    // Then open the dialog
    setIsAddEmployeeShiftOpen(true);
    
    // Verify the state was updated correctly
    setTimeout(() => {
      console.log('Employee shift dialog state after update:', {
        isOpen: isAddEmployeeShiftOpen,
        employeeId,
        selectedDay: date.toISOString()
      });
    }, 100);
  };

  // Enhanced function for creating a new shift
  const handleSubmitAddShift = async (formData: any) => {
    console.log('Submitting add shift form with data:', formData);
    try {
      // Basic validation
      if (!formData.title || !formData.start_time || !formData.end_time) {
        toast({
          title: "Missing fields",
          description: "Please fill all required fields",
          variant: "destructive"
        });
        return;
      }
      
      // Determine if it's an employee-specific shift or an open shift
      if (formData.employee_id) {
        // If employee is selected, create a direct assignment
        try {
          await createShiftAssignment(formData.employee_id, {
            title: formData.title,
            startTime: formData.start_time,
            endTime: formData.end_time,
            location: formData.location,
            notes: formData.notes
          });
          
          toast({
            title: "Shift assigned",
            description: `Successfully assigned shift to employee`
          });
          
          recordCalendarAction('create_employee_shift', new Date(formData.start_time), {
            employee_id: formData.employee_id,
            title: formData.title
          });
        } catch (error) {
          console.error('Error creating employee shift:', error);
          toast({
            title: "Error",
            description: "Failed to create employee shift",
            variant: "destructive"
          });
          return;
        }
      } else {
        // Create an open shift
        const { data, error } = await supabase
          .from('open_shifts')
          .insert({
            title: formData.title,
            start_time: formData.start_time,
            end_time: formData.end_time,
            notes: formData.notes,
            location: formData.location,
            status: 'pending',
            created_by: user?.id,
            created_platform: isMobile ? 'mobile' : 'desktop',
            last_modified_platform: isMobile ? 'mobile' : 'desktop',
            role: formData.role || undefined
          })
          .select()
          .single();
        
        if (error) {
          console.error('Error creating open shift:', error);
          toast({
            title: "Error",
            description: "Failed to create open shift",
            variant: "destructive"
          });
          return;
        }
        
        console.log('Successfully created open shift:', data);
        
        // If published to calendar, also create a calendar entry
        if (formData.published) {
          try {
            // Create a corresponding schedule entry
            const { data: scheduleData, error: scheduleError } = await supabase
              .from('schedules')
              .insert({
                title: formData.title,
                start_time: formData.start_time,
                end_time: formData.end_time,
                notes: formData.notes,
                location: formData.location,
                status: 'pending',
                published: true,
                shift_type: 'open_shift',
                color: '#FFAB91'  // Default color for open shifts
              })
              .select()
              .single();
              
            if (scheduleError) {
              console.error('Error publishing to calendar:', scheduleError);
              toast({
                title: "Warning",
                description: "Shift was created but could not be published to calendar",
                variant: "destructive"
              });
            } else {
              console.log('Calendar entry created successfully:', scheduleData);
              toast({
                title: "Shift published",
                description: "The open shift has been published to the calendar"
              });
              
              recordCalendarAction('publish_shift_to_calendar', new Date(formData.start_time), {
                shift_id: data.id,
                schedule_id: scheduleData.id
              });
            }
          } catch (syncErr) {
            console.error('Exception publishing to calendar:', syncErr);
            toast({
              title: "Warning",
              description: "Shift was created but could not be published to calendar",
              variant: "destructive"
            });
          }
        } else {
          toast({
            title: "Shift created",
            description: "The open shift has been created successfully"
          });
          
          recordCalendarAction('create_open_shift', new Date(formData.start_time), {
            shift_id: data.id,
            title: formData.title
          });
        }
      }
      
      // Important: Reset isAddShiftOpen state and refetch schedules
      setIsAddShiftOpen(false);
      refetch();
    } catch (error) {
      console.error('Error creating shift:', error);
      toast({
        title: "Error",
        description: "Failed to create shift",
        variant: "destructive"
      });
    }
  };

  // Keep existing functions for submitting employee shifts and swap shifts
  const handleSubmitEmployeeShift = async (formData: any) => {
    try {
      if (!selectedEmployee || !formData.title || !formData.start_time || !formData.end_time) {
        toast({
          title: "Missing fields",
          description: "Please select an employee and fill all required fields",
          variant: "destructive"
        });
        return;
      }
      
      // Create the employee schedule
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('schedules')
        .insert({
          employee_id: selectedEmployee,
          title: formData.title,
          start_time: formData.start_time,
          end_time: formData.end_time,
          notes: formData.notes,
          location: formData.location,
          status: 'pending',
          published: true
        })
        .select()
        .single();
      
      if (scheduleError) throw scheduleError;
      
      // Create an open shift reference
      const { data: openShiftData, error: openShiftError } = await supabase
        .from('open_shifts')
        .insert({
          title: formData.title,
          start_time: formData.start_time,
          end_time: formData.end_time,
          notes: formData.notes,
          location: formData.location,
          status: 'pending',
          created_by: user?.id,
          created_platform: isMobile ? 'mobile' : 'desktop'
        })
        .select()
        .single();
      
      if (openShiftError) throw openShiftError;
      
      // Create shift assignment connecting open shift to schedule
      const { error: assignmentError } = await supabase
        .from('open_shift_assignments')
        .insert({
          open_shift_id: openShiftData.id,
          employee_id: selectedEmployee,
          assigned_by: user?.id,
          status: 'pending'
        });
      
      if (assignmentError) throw assignmentError;
      
      // Notify the employee
      const { data: employee } = await supabase
        .from('employees')
        .select('user_id, name')
        .eq('id', selectedEmployee)
        .maybeSingle();
        
      if (employee?.user_id) {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: employee.user_id,
            title: 'New Shift Assignment',
            message: `You have been assigned a new shift: ${formData.title} starting at ${format(new Date(formData.start_time), 'MMM dd, yyyy HH:mm')}`,
            type: 'info',
            related_entity: 'schedules',
            related_id: scheduleData.id
          });
          
        if (notificationError) {
          console.error('Error sending notification:', notificationError);
        }
      }
      
      toast({
        title: "Shift assigned",
        description: `Successfully assigned shift to ${employee?.name || 'employee'}`
      });
      
      // Reset the dialog state
      setIsAddEmployeeShiftOpen(false);
      refetch();
    } catch (error) {
      console.error('Error assigning shift:', error);
      toast({
        title: "Error",
        description: "Failed to assign shift",
        variant: "destructive"
      });
    }
  };

  const handleSubmitSwapShift = async (formData: any) => {
    // Implementation for shift swapping
    console.log('Swap shift form submitted:', formData);
  };

  // Helper function to record calendar actions
  const recordCalendarAction = async (actionType: string, date: Date, details = {}) => {
    console.log(`Calendar action logged: ${actionType}`);
    
    try {
      // If user is authenticated, record the action
      if (user) {
        await supabase.from('calendar_actions').insert({
          action_type: actionType,
          date: date.toISOString(),
          initiator_id: user.id,
          details: {
            ...details,
            platform: isMobile ? 'mobile' : 'desktop',
            timestamp: Date.now()
          }
        });
      }
    } catch (error) {
      console.error('Failed to record calendar action:', error);
    }
  };

  // Handle click on an existing shift
  const handleShiftClick = (shift: any) => {
    setSelectedShift(shift);
    
    toast({
      title: "Shift details",
      description: `${shift.title} (${format(new Date(shift.start_time), 'h:mm a')} - ${format(new Date(shift.end_time), 'h:mm a')})`,
    });
  };

  return {
    isAdmin,
    isHR,
    isManager,
    schedules: filteredSchedules,
    isLoading,
    selectedDate,
    month,
    year,
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
    employees,
    isMobile,
    handleNextPeriod,
    handlePreviousPeriod,
    handleToday,
    handleAddShift,
    handleSwapShift,
    handleAddEmployeeShift,
    handleSubmitAddShift,
    handleSubmitEmployeeShift,
    handleSubmitSwapShift,
    handleShiftClick,
    handleNextMonth,
    handlePrevMonth,
    handleEmployeeAddShift,
    user,
    toast,
    refetch
  };
};
