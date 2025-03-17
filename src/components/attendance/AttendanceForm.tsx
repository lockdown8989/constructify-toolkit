
import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Employee } from '@/hooks/use-employees';
import { UserCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';

interface AttendanceFormProps {
  employees: Employee[];
}

export function AttendanceForm({ employees }: AttendanceFormProps) {
  const [selectedEmployee, setSelectedEmployee] = React.useState<string>('');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('Present');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const markAttendanceMutation = useMutation({
    mutationFn: async ({ employeeId, status }: { employeeId: string; status: string }) => {
      const { data, error } = await supabase
        .from('attendance')
        .insert([{
          employee_id: employeeId,
          status,
          check_in: new Date().toISOString(),
        }]);
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast({
        title: 'Attendance recorded',
        description: 'Employee attendance has been successfully recorded.',
      });
      setSelectedEmployee('');
    },
    onError: (error) => {
      toast({
        title: 'Failed to record attendance',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  });
  
  const handleMarkAttendance = () => {
    if (!selectedEmployee) {
      toast({
        title: 'Employee required',
        description: 'Please select an employee to mark attendance.',
        variant: 'destructive',
      });
      return;
    }
    
    markAttendanceMutation.mutate({ 
      employeeId: selectedEmployee, 
      status: selectedStatus 
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Tracker</CardTitle>
        <CardDescription>Record daily attendance for your employees</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employee-select">Select Employee</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger id="employee-select">
                  <SelectValue placeholder="Select an employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(employee => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status-select">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger id="status-select">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Present">Present</SelectItem>
                  <SelectItem value="Late">Late</SelectItem>
                  <SelectItem value="Absent">Absent</SelectItem>
                  <SelectItem value="Leave">Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={handleMarkAttendance}
              disabled={!selectedEmployee || markAttendanceMutation.isPending}
            >
              <UserCheck className="mr-2 h-4 w-4" />
              Mark Attendance
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="text-sm text-gray-500 flex items-center">
        <Calendar className="mr-2 h-4 w-4" />
        <span>Today: {format(new Date(), 'MMMM d, yyyy')}</span>
      </CardFooter>
    </Card>
  );
}
