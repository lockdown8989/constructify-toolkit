
import React from 'react';
import { Employee, Shift } from '@/types/restaurant-schedule';
import { OpenShiftType } from '@/types/supabase/schedules';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, User } from 'lucide-react';

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
  // Group shifts by date
  const groupedShifts = React.useMemo(() => {
    const groups: Record<string, { shifts: Shift[]; openShifts: OpenShiftType[] }> = {};
    
    // Group regular shifts
    shifts.forEach(shift => {
      const date = shift.day; // You might need to convert this to actual date
      if (!groups[date]) {
        groups[date] = { shifts: [], openShifts: [] };
      }
      groups[date].shifts.push(shift);
    });
    
    // Group open shifts
    openShifts.forEach(openShift => {
      const date = format(new Date(openShift.start_time), 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = { shifts: [], openShifts: [] };
      }
      groups[date].openShifts.push(openShift);
    });
    
    return groups;
  }, [shifts, openShifts]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold mb-4">
        Schedule List - {format(currentWeek.start, 'MMM d')} to {format(currentWeek.end, 'MMM d, yyyy')}
      </h3>
      
      <div className="space-y-6">
        {Object.entries(groupedShifts).map(([date, { shifts: dayShifts, openShifts: dayOpenShifts }]) => (
          <div key={date} className="border-b border-gray-100 pb-4 last:border-b-0">
            <h4 className="font-medium text-gray-900 mb-3 capitalize">
              {date}
            </h4>
            
            {/* Regular Shifts */}
            {dayShifts.length > 0 && (
              <div className="space-y-2 mb-4">
                <h5 className="text-sm font-medium text-gray-700">Scheduled Shifts</h5>
                {dayShifts.map(shift => {
                  const employee = employees.find(emp => emp.id === shift.employeeId);
                  return (
                    <div key={shift.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">{employee?.name || 'Unknown'}</span>
                        </div>
                        <Badge variant="secondary">{shift.role}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        {shift.startTime} - {shift.endTime}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Open Shifts */}
            {dayOpenShifts.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-gray-700">Open Shifts</h5>
                {dayOpenShifts.map(openShift => (
                  <div key={openShift.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{openShift.title}</span>
                      </div>
                      {openShift.role && <Badge variant="outline">{openShift.role}</Badge>}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      {format(new Date(openShift.start_time), 'HH:mm')} - {format(new Date(openShift.end_time), 'HH:mm')}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {dayShifts.length === 0 && dayOpenShifts.length === 0 && (
              <p className="text-gray-500 text-sm italic">No shifts scheduled</p>
            )}
          </div>
        ))}
        
        {Object.keys(groupedShifts).length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No shifts found for this week</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListView;
