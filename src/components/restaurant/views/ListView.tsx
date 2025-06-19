
import React from 'react';
import { Employee, Shift } from '@/types/restaurant-schedule';
import { OpenShiftType } from '@/types/supabase/schedules';
import { format } from 'date-fns';
import { Clock, User, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ListViewProps {
  employees: Employee[];
  shifts: Shift[];
  openShifts: OpenShiftType[];
  currentWeek: { start: Date; end: Date };
}

const ListView: React.FC<ListViewProps> = ({
  employees,
  shifts,
  openShifts,
  currentWeek
}) => {
  // Group shifts by day
  const groupedShifts = shifts.reduce((acc, shift) => {
    if (!acc[shift.day]) {
      acc[shift.day] = [];
    }
    acc[shift.day].push(shift);
    return acc;
  }, {} as Record<string, Shift[]>);

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-4 border-b bg-gray-50 rounded-t-xl">
        <h3 className="text-lg font-semibold text-gray-900">
          Schedule List View
        </h3>
        <p className="text-sm text-gray-600">
          {format(currentWeek.start, 'MMM d')} - {format(currentWeek.end, 'MMM d, yyyy')}
        </p>
      </div>

      <div className="divide-y divide-gray-100">
        {days.map((day, index) => {
          const dayShifts = groupedShifts[day] || [];
          const dayDate = new Date(currentWeek.start);
          dayDate.setDate(dayDate.getDate() + index);

          return (
            <div key={day} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-base font-medium text-gray-900">
                  {dayNames[index]}
                </h4>
                <span className="text-sm text-gray-500">
                  {format(dayDate, 'MMM d')}
                </span>
              </div>

              {dayShifts.length === 0 ? (
                <div className="text-sm text-gray-400 italic py-2">
                  No shifts scheduled
                </div>
              ) : (
                <div className="space-y-2">
                  {dayShifts.map(shift => {
                    const employee = employees.find(e => e.id === shift.employeeId);
                    return (
                      <div
                        key={shift.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium"
                            style={{ backgroundColor: employee?.color || '#6B7280' }}
                          >
                            {employee?.name.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                          </div>
                          
                          <div>
                            <div className="font-medium text-sm text-gray-900">
                              {employee?.name || 'Unknown Employee'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {employee?.role || 'Staff'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            {shift.startTime} - {shift.endTime}
                          </div>
                          
                          <Badge variant="secondary" className="text-xs">
                            {shift.role}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ListView;
