
import { useState, useEffect } from 'react';
import { addDays, format, subDays, isToday } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useCreateSchedule } from '@/hooks/use-schedules';

export function useCalendarState() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week'>('week');
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const { toast } = useToast();
  const { createSchedule } = useCreateSchedule();
  
  const isCurrentDateToday = isToday(currentDate);
  
  // Navigation functions
  const handlePrevious = () => {
    setCurrentDate(prevDate => subDays(prevDate, view === 'day' ? 1 : 7));
  };
  
  const handleNext = () => {
    setCurrentDate(prevDate => addDays(prevDate, view === 'day' ? 1 : 7));
  };
  
  const handleToday = () => {
    setCurrentDate(new Date());
  };
  
  // Open add sheet for the current date
  const handleAddShift = () => {
    setIsAddSheetOpen(true);
  };
  
  // Handle add shift form submission
  const handleSubmitAddShift = async (formData: any) => {
    try {
      // Add validation
      if (!formData.title || !formData.start_time || !formData.end_time) {
        toast({
          title: "Missing information",
          description: "Please fill out all required fields",
          variant: "destructive"
        });
        return;
      }
      
      // Create open shift
      await createSchedule.mutateAsync({
        title: formData.title,
        start_time: formData.start_time,
        end_time: formData.end_time,
        location: formData.location,
        notes: formData.notes,
        status: 'open',
        shift_type: 'open_shift'
      });
      
      toast({
        title: "Open shift created",
        description: "The shift has been added to the calendar"
      });
      
      // Close sheet
      setIsAddSheetOpen(false);
    } catch (error) {
      console.error('Error creating open shift:', error);
      toast({
        title: "Error",
        description: "Failed to create open shift. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return {
    currentDate,
    setCurrentDate,
    view,
    setView,
    isCurrentDateToday,
    isAddSheetOpen,
    setIsAddSheetOpen,
    handlePrevious,
    handleNext,
    handleToday,
    handleAddShift,
    handleSubmitAddShift
  };
}
