import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth';
import { useEmployees } from '@/hooks/use-employees';
import { useSchedules } from '@/hooks/use-schedules';
import { useIsMobile } from '@/hooks/use-mobile';
import { addDays, format, subDays, startOfDay, endOfDay, addMonths, subMonths } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useShiftCalendarState = () => {
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
  
  // Add month and year properties
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  
  // State for shift management
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [isAddShiftOpen, setIsAddShiftOpen] = useState(false);
  const [isSwapShiftOpen, setIsSwapShiftOpen] = useState(false);
  const [isAddEmployeeShiftOpen, setIsAddEmployeeShiftOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [selectedShift, setSelectedShift] = useState<any | null>(null);
  
  // Update visible days when the selected date or view changes
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

  // Calendar navigation functions
  const handleNextPeriod = () => {
    setSelectedDate(prevDate => addDays(prevDate, weekView ? 7 : 1));
  };

  const handlePreviousPeriod = () => {
    setSelectedDate(prevDate => subDays(prevDate, weekView ? 7 : 1));
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  // Month navigation functions
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

  // Shift management functions
  const handleAddShift = (day: Date) => {
    setSelectedDay(day);
    setIsAddShiftOpen(true);
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

  // Function to add a new open shift
  const handleSubmitAddShift = async (formData: any) => {
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
      
      // Create new schedule with shift_type as open_shift
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
        throw error;
      }
      
      // If published to calendar, also create a calendar entry
      if (formData.published) {
        try {
          // Sync with calendar using the RPC function
          const { data: syncResult, error: syncError } = await supabase.rpc('sync_open_shift_to_calendar', {
            shift_id: data.id
          });
          
          if (syncError) {
            console.error('Error syncing to calendar:', syncError);
            toast({
              title: "Warning",
              description: "Shift was created but could not be published to calendar",
              variant: "destructive"
            });
          } else {
            console.log('Calendar sync successful:', syncResult);
            toast({
              title: "Shift published",
              description: "The open shift has been published to the calendar"
            });
          }
        } catch (syncErr) {
          console.error('Exception syncing to calendar:', syncErr);
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
      }
      
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

  const handleShiftClick = (shift: any) => {
    setSelectedShift(shift);
    setIsSwapShiftOpen(true);
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
    allEmployeeSchedules,
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
    handlePrevMonth
  };
};
