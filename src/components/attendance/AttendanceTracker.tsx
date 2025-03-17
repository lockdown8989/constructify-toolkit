import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEmployees } from '@/hooks/use-employees';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Calendar, Clock, CheckCheck, UserCheck } from 'lucide-react';
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

interface AttendanceRecord {
  id: string;
  employee_id: string;
  check_in: string;
  check_out: string | null;
  status: string;
}

export function AttendanceTracker() {
  const { data: employees = [] } = useEmployees();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('Present');
  
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const { data: attendanceRecords = [] } = useQuery({
    queryKey: ['attendance', today],
    queryFn: async () => {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .gte('check_in', startOfDay.toISOString());
        
      if (error) throw error;
      return data as AttendanceRecord[];
    }
  });
  
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
  
  const checkOutMutation = useMutation({
    mutationFn: async (attendanceId: string) => {
      const { data, error } = await supabase
        .from('attendance')
        .update({ check_out: new Date().toISOString() })
        .eq('id', attendanceId)
        .select();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast({
        title: 'Check-out recorded',
        description: 'Employee check-out has been successfully recorded.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to record check-out',
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
  
  const handleCheckOut = (attendanceId: string) => {
    checkOutMutation.mutate(attendanceId);
  };
  
  const getEmployeeName = (id: string) => {
    const employee = employees.find(emp => emp.id === id);
    return employee ? employee.name : 'Unknown';
  };
  
  return (
    <div className="space-y-6">
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
      
      <Card>
        <CardHeader>
          <CardTitle>Today's Attendance</CardTitle>
          <CardDescription>
            Records for {format(new Date(), 'MMMM d, yyyy')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {attendanceRecords.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No attendance records for today
            </div>
          ) : (
            <div className="border rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check-in
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check-out
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendanceRecords.map(record => (
                    <tr key={record.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getEmployeeName(record.employee_id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          record.status === 'Present' ? 'bg-green-100 text-green-800' :
                          record.status === 'Late' ? 'bg-yellow-100 text-yellow-800' :
                          record.status === 'Absent' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.check_in ? format(new Date(record.check_in), 'h:mm a') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.check_out ? format(new Date(record.check_out), 'h:mm a') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {record.status !== 'Absent' && !record.check_out && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleCheckOut(record.id)}
                            disabled={checkOutMutation.isPending}
                          >
                            <CheckCheck className="mr-1 h-4 w-4" />
                            Check Out
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
