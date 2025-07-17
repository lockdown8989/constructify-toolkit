
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, UserX, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

const EmployeeInfoCard = () => {
  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['employees-dashboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      console.log('Employee data fetched:', data);
      return data || [];
    },
    refetchInterval: 10000,
  });

  const { data: todayAttendance = [] } = useQuery({
    queryKey: ['today-attendance'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          employees(id, name)
        `)
        .eq('date', today)
        .eq('active_session', true);

      if (error) throw error;
      console.log('Today attendance data:', data);
      return data || [];
    },
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Employee Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-pulse text-muted-foreground">Loading employee data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeEmployees = employees.filter(emp => emp.status === 'Active');
  const currentlyWorking = todayAttendance.filter(att => 
    att.current_status === 'clocked-in' || 
    (att.active_session && !att.check_out && att.check_in)
  );
  const onBreak = todayAttendance.filter(att => 
    att.on_break === true || att.current_status === 'on-break'
  );

  console.log('Dashboard stats:', {
    totalEmployees: employees.length,
    activeEmployees: activeEmployees.length,
    currentlyWorking: currentlyWorking.length,
    onBreak: onBreak.length,
    todayAttendanceCount: todayAttendance.length
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Employee Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Employee Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">{activeEmployees.length}</span>
            </div>
            <p className="text-xs text-muted-foreground">Total Active</p>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <UserCheck className="h-4 w-4 text-green-600" />
              <span className="text-2xl font-bold text-green-600">{currentlyWorking.length}</span>
            </div>
            <p className="text-xs text-muted-foreground">Currently Working</p>
          </div>
        </div>

        {/* Break Status */}
        {onBreak.length > 0 && (
          <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-lg font-semibold text-yellow-600">{onBreak.length}</span>
            </div>
            <p className="text-xs text-muted-foreground">On Break</p>
          </div>
        )}

        {/* Currently Working List */}
        {currentlyWorking.length > 0 && (
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Currently Clocked In</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {currentlyWorking.slice(0, 4).map((attendance: any) => {
                const isOnBreak = attendance.on_break === true || attendance.current_status === 'on-break';
                return (
                  <div key={attendance.id} className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{attendance.employees?.name || 'Unknown Employee'}</p>
                      <p className="text-xs text-muted-foreground">
                        Clocked in: {new Date(attendance.check_in).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {isOnBreak ? (
                        <Badge variant="outline" className="text-xs border-yellow-300 text-yellow-700">
                          On Break
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                          Working
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
              {currentlyWorking.length > 4 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{currentlyWorking.length - 4} more employees working
                </p>
              )}
            </div>
          </div>
        )}

        {/* No one working message */}
        {currentlyWorking.length === 0 && (
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <UserX className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No employees currently working</p>
          </div>
        )}

        {/* Department Breakdown */}
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-2">By Department</h4>
          <div className="space-y-1">
            {Object.entries(
              activeEmployees.reduce((acc: { [key: string]: number }, emp) => {
                acc[emp.department] = (acc[emp.department] || 0) + 1;
                return acc;
              }, {})
            ).slice(0, 3).map(([dept, count]) => (
              <div key={dept} className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{dept}</span>
                <Badge variant="secondary" className="text-xs">{count as number}</Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeInfoCard;
