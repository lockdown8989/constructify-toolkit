
import { useState } from 'react';
import { addDays, isToday } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { ViewType } from '../types/calendar-types';
import { useCreateSchedule } from '@/hooks/use-schedules';

export function useCalendarState() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('day');
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const { toast } = useToast();
  const { createSchedule } = useCreateSchedule();
  
  const isCurrentDateToday = isToday(currentDate);
  
  // Navigation functions
  const handlePrevious = () => {
    if (view === 'day') {
      setCurrentDate(prev => addDays(prev, -1));
    } else if (view === 'week') {
      setCurrentDate(prev => addDays(prev, -7));
    } else {
      // Month view - we'll still move by week for now
      setCurrentDate(prev => addDays(prev, -30));
    }
  };

  const handleNext = () => {
    if (view === 'day') {
      setCurrentDate(prev => addDays(prev, 1));
    } else if (view === 'week') {
      setCurrentDate(prev => addDays(prev, 7));
    } else {
      // Month view - we'll still move by week for now
      setCurrentDate(prev => addDays(prev, 30));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };
  
  const handleAddShift = () => {
    setIsAddSheetOpen(true);
  };
  
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
      
      // Create open shift - only include properties that exist in the Schedule type
      await createSchedule.mutateAsync({
        title: formData.title,
        start_time: formData.start_time,
        end_time: formData.end_time,
        location: formData.location,
        notes: formData.notes,
        status: 'pending' // Use 'pending' status which is valid
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
