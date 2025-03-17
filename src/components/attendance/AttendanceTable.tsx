
import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Employee } from '@/hooks/use-employees';

interface AttendanceRecord {
  id: string;
  employee_id: string;
  check_in: string;
  check_out: string | null;
  status: string;
}

interface AttendanceTableProps {
  attendanceRecords: AttendanceRecord[];
  employees: Employee[];
}

export function AttendanceTable({ attendanceRecords, employees }: AttendanceTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
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
  
  const handleCheckOut = (attendanceId: string) => {
    checkOutMutation.mutate(attendanceId);
  };
  
  const getEmployeeName = (id: string) => {
    const employee = employees.find(emp => emp.id === id);
    return employee ? employee.name : 'Unknown';
  };

  return (
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
  );
}
