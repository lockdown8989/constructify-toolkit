
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Save, Loader2 } from 'lucide-react';
import { useShiftPatterns } from '@/hooks/use-shift-patterns';
import { useEmployees } from '@/hooks/use-employees';
import { useEmployeeShiftAssignments } from '@/hooks/use-employee-shift-assignments';
import EmployeeSelector from './components/EmployeeSelector';
import DefaultPatternSelector from './components/DefaultPatternSelector';
import DaySpecificAssignments from './components/DaySpecificAssignments';
import {
  LoadingState,
  ErrorState,
  EmptyEmployeesState,
  EmptyShiftPatternsState,
  EmployeeDataLoading
} from './components/LoadingStates';

const EmployeeShiftAssignmentComponent = () => {
  const { data: shiftPatterns = [], isLoading: patternsLoading, error: patternsError } = useShiftPatterns();
  const { data: employees = [], isLoading: employeesLoading, error: employeesError } = useEmployees();
  
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  
  const {
    assignments,
    isLoading,
    loadingEmployee,
    loadEmployeeShifts,
    saveAssignments,
    handleAssignmentChange,
    resetAssignments
  } = useEmployeeShiftAssignments();

  const handleEmployeeSelect = (employeeId: string) => {
    console.log('Employee selected:', employeeId);
    
    // Validate employeeId before proceeding
    if (!employeeId || employeeId === 'undefined' || employeeId === 'null') {
      console.warn('Invalid employee ID selected:', employeeId);
      setSelectedEmployee('');
      resetAssignments();
      return;
    }

    setSelectedEmployee(employeeId);
    
    if (employeeId) {
      loadEmployeeShifts(employeeId);
    } else {
      resetAssignments();
    }
  };

  const handleSave = () => {
    saveAssignments(selectedEmployee);
  };

  // Show loading state
  if (patternsLoading || employeesLoading) {
    return <LoadingState />;
  }

  // Show error state
  if (patternsError || employeesError) {
    const errorMessage = patternsError?.message || employeesError?.message || 'Failed to load data';
    return <ErrorState errorMessage={errorMessage} />;
  }

  // Show empty state if no data
  if (!employees || employees.length === 0) {
    return <EmptyEmployeesState />;
  }

  if (!shiftPatterns || shiftPatterns.length === 0) {
    return <EmptyShiftPatternsState />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Employee Shift Assignment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <EmployeeSelector
          employees={employees}
          selectedEmployee={selectedEmployee}
          onEmployeeSelect={handleEmployeeSelect}
        />

        {selectedEmployee && (
          <div className="space-y-4">
            {loadingEmployee ? (
              <EmployeeDataLoading />
            ) : (
              <>
                <DefaultPatternSelector
                  shiftPatterns={shiftPatterns}
                  selectedPatternId={assignments.shift_pattern_id}
                  onPatternChange={(value) => handleAssignmentChange('shift_pattern_id', value)}
                />

                <DaySpecificAssignments
                  shiftPatterns={shiftPatterns}
                  assignments={assignments}
                  onAssignmentChange={handleAssignmentChange}
                />

                <Button onClick={handleSave} disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Assignments
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmployeeShiftAssignmentComponent;
