
import React from 'react';
import { Card } from '@/components/ui/card';
import { useAttendance } from '@/hooks/use-attendance';
import { useLeaveCalendar } from '@/hooks/use-leave-calendar';
import { useEmployees } from '@/hooks/use-employees';
import { Plane, Clock, LogOut } from 'lucide-react';

const AttendanceOverview = () => {
  const { data: attendanceData } = useAttendance();
  const { data: leaves = [] } = useLeaveCalendar();
  const { data: employees = [] } = useEmployees();

  // Get today's date
  const today = new Date().toISOString().split('T')[0];
  
  // Calculate holiday count (approved leaves for today)
  const holidayCount = leaves.filter(leave => {
    const startDate = new Date(leave.start_date).toISOString().split('T')[0];
    const endDate = new Date(leave.end_date).toISOString().split('T')[0];
    return leave.status === 'Approved' && 
           startDate <= today && 
           endDate >= today;
  }).length;

  // Get employees on holiday today
  const employeesOnHoliday = employees.filter(employee => {
    return leaves.some(leave => {
      const startDate = new Date(leave.start_date).toISOString().split('T')[0];
      const endDate = new Date(leave.end_date).toISOString().split('T')[0];
      return leave.employee_id === employee.id &&
             leave.status === 'Approved' && 
             startDate <= today && 
             endDate >= today;
    });
  });

  // Calculate clocked in/out numbers from attendance data
  const clockedInCount = attendanceData?.present || 0;
  const clockedOutCount = attendanceData?.total ? (attendanceData.total - attendanceData.present) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
      {/* Holiday Card */}
      <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Holiday ({holidayCount})</h3>
              <div className="flex items-center space-x-1 mt-1">
                {employeesOnHoliday.slice(0, 4).map((employee, index) => (
                  <div
                    key={employee.id}
                    className="w-8 h-8 rounded-full overflow-hidden border-2 border-white"
                    style={{ marginLeft: index > 0 ? '-8px' : '0' }}
                  >
                    {employee.avatar ? (
                      <img 
                        src={employee.avatar} 
                        alt={employee.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-400 flex items-center justify-center text-white text-xs font-semibold">
                        {employee.name.charAt(0)}
                      </div>
                    )}
                  </div>
                ))}
                {employeesOnHoliday.length > 4 && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 border-2 border-white" style={{ marginLeft: '-8px' }}>
                    +{employeesOnHoliday.length - 4}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-green-600 font-medium">+1</span>
          </div>
        </div>
      </Card>

      {/* Clocked In Card */}
      <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Clocked in ({clockedInCount})</h3>
              <div className="flex items-center space-x-1 mt-1">
                {employees.slice(0, 4).map((employee, index) => (
                  <div
                    key={employee.id}
                    className="w-8 h-8 rounded-full overflow-hidden border-2 border-white"
                    style={{ marginLeft: index > 0 ? '-8px' : '0' }}
                  >
                    {employee.avatar ? (
                      <img 
                        src={employee.avatar} 
                        alt={employee.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-green-400 flex items-center justify-center text-white text-xs font-semibold">
                        {employee.name.charAt(0)}
                      </div>
                    )}
                  </div>
                ))}
                {employees.length > 4 && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 border-2 border-white" style={{ marginLeft: '-8px' }}>
                    +{Math.max(0, clockedInCount - 4)}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-green-600 font-medium">+38</span>
          </div>
        </div>
      </Card>

      {/* Clocked Out Card */}
      <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
              <LogOut className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Clocked out ({clockedOutCount})</h3>
              <div className="flex items-center space-x-1 mt-1">
                {employees.slice(0, 4).map((employee, index) => (
                  <div
                    key={employee.id}
                    className="w-8 h-8 rounded-full overflow-hidden border-2 border-white opacity-60"
                    style={{ marginLeft: index > 0 ? '-8px' : '0' }}
                  >
                    {employee.avatar ? (
                      <img 
                        src={employee.avatar} 
                        alt={employee.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-red-400 flex items-center justify-center text-white text-xs font-semibold">
                        {employee.name.charAt(0)}
                      </div>
                    )}
                  </div>
                ))}
                {employees.length > 4 && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 border-2 border-white opacity-60" style={{ marginLeft: '-8px' }}>
                    +{Math.max(0, clockedOutCount - 4)}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-green-600 font-medium">+5</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AttendanceOverview;
