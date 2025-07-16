import { useMemo, useState } from 'react';
import { useEmployeeDataManagement } from '@/hooks/use-employee-data-management';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { format } from 'date-fns';

export const useEmployeeRotaLogic = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'week' | 'month' | 'list'>('week');
  
  const { allEmployees, isLoading: isLoadingEmployeeData, error } = useEmployeeDataManagement();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Use employee data for rota management
  const finalEmployees = allEmployees && allEmployees.length > 0 ? allEmployees : [];
  
  // Handle date click
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsDateDialogOpen(true);
  };

  // Handle view changes
  const handleViewChange = (view: 'week' | 'month' | 'list') => {
    setCurrentView(view);
  };

  return {
    // State
    selectedDate,
    isDateDialogOpen,
    setIsDateDialogOpen,
    currentView,
    handleViewChange,
    
    // Data
    finalEmployees,
    
    // Loading states
    isLoading: isLoadingEmployeeData,
    error,
    
    // Utilities
    isMobile,
    
    // Actions
    handleDateClick,
  };
};