
import { useState } from 'react';
import { addDays, isToday } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { ViewType } from '../types/calendar-types';

export const useCalendarState = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('day');
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const { toast } = useToast();

  const handlePrevious = () => {
    if (view === 'day') {
      setCurrentDate(prev => addDays(prev, -1));
    } else {
      setCurrentDate(prev => addDays(prev, -7));
    }
  };

  const handleNext = () => {
    if (view === 'day') {
      setCurrentDate(prev => addDays(prev, 1));
    } else {
      setCurrentDate(prev => addDays(prev, 7));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };
  
  const handleAddShift = () => {
    setIsAddSheetOpen(true);
  };
  
  const handleSubmitAddShift = () => {
    toast({
      title: "Shift added",
      description: "New shift has been successfully added to the schedule",
    });
    setIsAddSheetOpen(false);
  };

  return {
    currentDate,
    setCurrentDate,
    view,
    setView,
    isCurrentDateToday: isToday(currentDate),
    isAddSheetOpen,
    setIsAddSheetOpen,
    handlePrevious,
    handleNext,
    handleToday,
    handleAddShift,
    handleSubmitAddShift
  };
};
