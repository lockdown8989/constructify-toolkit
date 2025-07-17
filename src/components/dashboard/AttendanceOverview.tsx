
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLeaveCalendar } from '@/hooks/use-leave-calendar';
import { useEmployees } from '@/hooks/use-employees';
import { Plane, Clock, LogOut } from 'lucide-react';
import AttendanceDetailModal from './AttendanceDetailModal';

const AttendanceOverview = () => {
  const { data: leaves = [] } = useLeaveCalendar();
  const { data: employees = [] } = useEmployees();
  const [selectedCardType, setSelectedCardType] = useState<'holiday' | 'clocked-in' | 'clocked-out' | null>(null);

  // Get today's date
  const today = new Date().toISOString().split('T')[0];
  
  // Fetch real attendance data for today
  const { data: attendanceData = [] } = useQuery({
    queryKey: ['attendance-overview', today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          employees!inner(id, name, avatar_url)
        `)
        .eq('date', today);

      if (error) {
        console.error('Error fetching attendance data:', error);
        return [];
      }

      console.log('Attendance data fetched for overview:', data);
      return data || [];
    },
    refetchInterval: 10000, // Refresh every 10 seconds for live updates
  });

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

  // Calculate actual clocked in/out numbers from real attendance data
  const clockedInCount = attendanceData.filter(record => 
    record.active_session && 
    (record.current_status === 'clocked-in' || record.current_status === 'on-break')
  ).length;

  // Count employees who have attendance records but are not currently active
  const totalEmployeesWithRecords = new Set(attendanceData.map(record => record.employee_id)).size;
  const clockedOutCount = Math.max(0, employees.length - clockedInCount - holidayCount);

  // Get actual employees who are clocked in
  const clockedInEmployees = attendanceData
    .filter(record => 
      record.active_session && 
      (record.current_status === 'clocked-in' || record.current_status === 'on-break')
    )
    .map(record => record.employees)
    .filter(Boolean);

  // Get employees who are clocked out (have records today but not active, or no records)
  const clockedInEmployeeIds = new Set(clockedInEmployees.map(emp => emp.id));
  const holidayEmployeeIds = new Set(employeesOnHoliday.map(emp => emp.id));
  const clockedOutEmployees = employees.filter(emp => 
    !clockedInEmployeeIds.has(emp.id) && !holidayEmployeeIds.has(emp.id)
  );

  console.log('AttendanceOverview calculations:', {
    holidayCount,
    clockedInCount,
    clockedOutCount,
    totalEmployees: employees.length,
    attendanceRecords: attendanceData.length,
    clockedInEmployees: clockedInEmployees.length,
    clockedOutEmployees: clockedOutEmployees.length
  });

  const handleCardClick = (cardType: 'holiday' | 'clocked-in' | 'clocked-out') => {
    setSelectedCardType(cardType);
  };

  const getEmployeesForModal = () => {
    switch (selectedCardType) {
      case 'holiday':
        return employeesOnHoliday;
      case 'clocked-in':
        return clockedInEmployees;
      case 'clocked-out':
        return clockedOutEmployees;
      default:
        return [];
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
        {/* Holiday Card */}
        <Card 
          className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleCardClick('holiday')}
        >
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
                      {employee.avatar_url ? (
                        <img 
                          src={employee.avatar_url} 
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
              <span className="text-xs text-green-600 font-medium">Live</span>
            </div>
          </div>
        </Card>

        {/* Clocked In Card */}
        <Card 
          className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleCardClick('clocked-in')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Clocked in ({clockedInCount})</h3>
                <div className="flex items-center space-x-1 mt-1">
                  {clockedInEmployees.slice(0, 4).map((employee, index) => (
                    <div
                      key={employee.id}
                      className="w-8 h-8 rounded-full overflow-hidden border-2 border-white"
                      style={{ marginLeft: index > 0 ? '-8px' : '0' }}
                    >
                      {employee.avatar_url ? (
                        <img 
                          src={employee.avatar_url} 
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
                  {clockedInEmployees.length > 4 && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 border-2 border-white" style={{ marginLeft: '-8px' }}>
                      +{Math.max(0, clockedInCount - 4)}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-green-600 font-medium">Live</span>
            </div>
          </div>
        </Card>

        {/* Clocked Out Card */}
        <Card 
          className="p-4 bg-gradient-to-br from-red-50 to-red-100 border-red-200 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleCardClick('clocked-out')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                <LogOut className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Clocked out ({clockedOutCount})</h3>
                <div className="flex items-center space-x-1 mt-1">
                  {clockedOutEmployees.slice(0, 4).map((employee, index) => (
                    <div
                      key={employee.id}
                      className="w-8 h-8 rounded-full overflow-hidden border-2 border-white opacity-60"
                      style={{ marginLeft: index > 0 ? '-8px' : '0' }}
                    >
                      {employee.avatar_url ? (
                        <img 
                          src={employee.avatar_url} 
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
                  {clockedOutEmployees.length > 4 && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 border-2 border-white opacity-60" style={{ marginLeft: '-8px' }}>
                      +{Math.max(0, clockedOutCount - 4)}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-green-600 font-medium">Live</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Detail Modal */}
      <AttendanceDetailModal
        isOpen={selectedCardType !== null}
        onClose={() => setSelectedCardType(null)}
        type={selectedCardType || 'holiday'}
        employees={getEmployeesForModal()}
        attendanceData={{
          present: clockedInCount,
          total: employees.length,
          holiday: holidayCount,
          absent: clockedOutCount
        }}
      />
    </>
  );
};

export default AttendanceOverview;
