
import React, { useState } from 'react';
import { useEmployeeRotaLogic } from './hooks/useEmployeeRotaLogic';
import EmployeeRotaCard from './EmployeeRotaCard';
import { Button } from '@/components/ui/button';
import { Calendar, List, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const RotaEmployeeManager = () => {
  const {
    finalEmployees,
    isLoading,
    currentView,
    handleViewChange,
    handleDateClick,
    selectedDate,
    isDateDialogOpen,
    setIsDateDialogOpen
  } = useEmployeeRotaLogic();

  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant={currentView === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleViewChange('week')}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Week View
          </Button>
          <Button
            variant={currentView === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleViewChange('month')}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Month View
          </Button>
          <Button
            variant={currentView === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleViewChange('list')}
            className="flex items-center gap-2"
          >
            <List className="h-4 w-4" />
            List View
          </Button>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          {finalEmployees.length} employees
        </div>
      </div>

      {/* Employee Cards */}
      <div className="grid gap-4">
        {finalEmployees.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No employees found</h3>
            <p className="text-sm text-muted-foreground">
              Add employees to start managing their rotas and schedules.
            </p>
          </div>
        ) : (
          finalEmployees.map((employee) => (
            <EmployeeRotaCard
              key={employee.id}
              employee={employee}
              onDateClick={handleDateClick}
              currentView={currentView}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default RotaEmployeeManager;
