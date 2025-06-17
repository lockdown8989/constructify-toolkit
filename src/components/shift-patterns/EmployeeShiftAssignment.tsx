
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Users, Save, AlertCircle, Loader2 } from 'lucide-react';
import { useShiftPatterns } from '@/hooks/use-shift-patterns';
import { useEmployees } from '@/hooks/use-employees';
import { DAYS_OF_WEEK, EmployeeShiftAssignment } from '@/types/shift-patterns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const EmployeeShiftAssignmentComponent = () => {
  const { data: shiftPatterns = [], isLoading: patternsLoading, error: patternsError } = useShiftPatterns();
  const { data: employees = [], isLoading: employeesLoading, error: employeesError } = useEmployees();
  const { toast } = useToast();
  
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [assignments, setAssignments] = useState<EmployeeShiftAssignment>({
    employee_id: '',
    shift_pattern_id: '',
    monday_shift_id: '',
    tuesday_shift_id: '',
    wednesday_shift_id: '',
    thursday_shift_id: '',
    friday_shift_id: '',
    saturday_shift_id: '',
    sunday_shift_id: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingEmployee, setLoadingEmployee] = useState(false);

  const loadEmployeeShifts = async (employeeId: string) => {
    if (!employeeId) return;
    
    setLoadingEmployee(true);
    try {
      console.log('Loading shifts for employee:', employeeId);
      
      const { data, error } = await supabase
        .from('employees')
        .select(`
          id,
          shift_pattern_id,
          monday_shift_id,
          tuesday_shift_id,
          wednesday_shift_id,
          thursday_shift_id,
          friday_shift_id,
          saturday_shift_id,
          sunday_shift_id
        `)
        .eq('id', employeeId)
        .single();

      if (error) {
        console.error('Error loading employee shifts:', error);
        toast({
          title: "Error",
          description: "Failed to load employee shift data. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        console.log('Loaded employee data:', data);
        setAssignments({
          employee_id: data.id,
          shift_pattern_id: data.shift_pattern_id || '',
          monday_shift_id: data.monday_shift_id || '',
          tuesday_shift_id: data.tuesday_shift_id || '',
          wednesday_shift_id: data.wednesday_shift_id || '',
          thursday_shift_id: data.thursday_shift_id || '',
          friday_shift_id: data.friday_shift_id || '',
          saturday_shift_id: data.saturday_shift_id || '',
          sunday_shift_id: data.sunday_shift_id || '',
        });
      }
    } catch (error) {
      console.error('Error in loadEmployeeShifts:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading employee data.",
        variant: "destructive",
      });
    } finally {
      setLoadingEmployee(false);
    }
  };

  const handleEmployeeSelect = (employeeId: string) => {
    console.log('Employee selected:', employeeId);
    setSelectedEmployee(employeeId);
    
    if (employeeId) {
      loadEmployeeShifts(employeeId);
    } else {
      // Reset assignments when no employee is selected
      setAssignments({
        employee_id: '',
        shift_pattern_id: '',
        monday_shift_id: '',
        tuesday_shift_id: '',
        wednesday_shift_id: '',
        thursday_shift_id: '',
        friday_shift_id: '',
        saturday_shift_id: '',
        sunday_shift_id: '',
      });
    }
  };

  const handleSave = async () => {
    if (!selectedEmployee) {
      toast({
        title: "Error",
        description: "Please select an employee first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Saving assignments:', assignments);
      
      const updateData = {
        shift_pattern_id: assignments.shift_pattern_id || null,
        monday_shift_id: assignments.monday_shift_id || null,
        tuesday_shift_id: assignments.tuesday_shift_id || null,
        wednesday_shift_id: assignments.wednesday_shift_id || null,
        thursday_shift_id: assignments.thursday_shift_id || null,
        friday_shift_id: assignments.friday_shift_id || null,
        saturday_shift_id: assignments.saturday_shift_id || null,
        sunday_shift_id: assignments.sunday_shift_id || null,
      };

      const { error } = await supabase
        .from('employees')
        .update(updateData)
        .eq('id', selectedEmployee);

      if (error) {
        console.error('Error updating shift assignments:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Employee shift assignments updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating shift assignments:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update shift assignments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignmentChange = (key: string, value: string) => {
    console.log('Assignment changed:', key, value);
    setAssignments(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Show loading state
  if (patternsLoading || employeesLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Employee Shift Assignment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (patternsError || employeesError) {
    const errorMessage = patternsError?.message || employeesError?.message || 'Failed to load data';
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Employee Shift Assignment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-2">Error loading data</p>
              <p className="text-gray-500 text-sm">{errorMessage}</p>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()} 
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show empty state if no data
  if (!employees || employees.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Employee Shift Assignment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No employees found</p>
            <p className="text-gray-500 text-sm">Add employees to assign shift patterns</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!shiftPatterns || shiftPatterns.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Employee Shift Assignment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-orange-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No shift patterns found</p>
            <p className="text-gray-500 text-sm">Create shift patterns first to assign them to employees</p>
          </div>
        </CardContent>
      </Card>
    );
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
        <div>
          <Label htmlFor="employee-select">Select Employee</Label>
          <Select onValueChange={handleEmployeeSelect} value={selectedEmployee}>
            <SelectTrigger>
              <SelectValue placeholder="Choose an employee..." />
            </SelectTrigger>
            <SelectContent>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.name} - {employee.job_title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedEmployee && (
          <div className="space-y-4">
            {loadingEmployee ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading employee data...</span>
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor="default-pattern">Default Shift Pattern</Label>
                  <Select 
                    value={assignments.shift_pattern_id} 
                    onValueChange={(value) => handleAssignmentChange('shift_pattern_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select default pattern..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No default pattern</SelectItem>
                      {shiftPatterns.map((pattern) => (
                        <SelectItem key={pattern.id} value={pattern.id}>
                          {pattern.name} ({pattern.start_time} - {pattern.end_time})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-4">Day-Specific Assignments</h4>
                  <div className="grid gap-3">
                    {DAYS_OF_WEEK.map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label className="w-20">{label}</Label>
                        <div className="flex-1 ml-4">
                          <Select 
                            value={assignments[key] || ''} 
                            onValueChange={(value) => handleAssignmentChange(key, value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Use default or select..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Use default pattern</SelectItem>
                              {shiftPatterns.map((pattern) => (
                                <SelectItem key={pattern.id} value={pattern.id}>
                                  {pattern.name} ({pattern.start_time} - {pattern.end_time})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

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
