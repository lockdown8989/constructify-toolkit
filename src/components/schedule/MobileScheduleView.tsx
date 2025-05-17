
import React from 'react';
import { Schedule } from '@/hooks/use-schedules';
import { Employee } from '@/types/restaurant-schedule';
import { Plus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAccessControl } from '@/hooks/leave/useAccessControl';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';

interface MobileScheduleViewProps {
  schedules: Schedule[];
  employees: Employee[];
  onAddShift: () => void;
  onShiftClick: (shift: any) => void;
  selectedDate?: Date;
  onDateClick?: (date: Date) => void; // Added this optional prop
}

const MobileScheduleView: React.FC<MobileScheduleViewProps> = ({
  schedules,
  employees,
  onAddShift,
  onShiftClick,
  selectedDate = new Date(),
  onDateClick
}) => {
  const { hasManagerAccess } = useAccessControl();

  // Handle date click if the function is provided
  const handleDateClick = () => {
    if (onDateClick && selectedDate) {
      onDateClick(selectedDate);
    }
  };

  return (
    <div className="p-4 pb-24">
      {/* Date indicator - now clickable if onDateClick provided */}
      <div 
        className={`mb-5 text-center ${onDateClick ? 'cursor-pointer active-touch-state' : ''}`}
        onClick={onDateClick ? handleDateClick : undefined}
      >
        <div className="text-sm text-muted-foreground mb-1">
          <Calendar className="h-4 w-4 inline-block mr-1.5" />
          {format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </div>
      </div>
      
      {hasManagerAccess && (
        <div className="mb-5">
          <Button 
            onClick={onAddShift}
            size="sm"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl active-touch-state"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Shift
          </Button>
        </div>
      )}
      
      {schedules.length === 0 ? (
        <div className="text-center p-8 text-gray-500">
          <p className="mb-2">No shifts scheduled for this date</p>
          {hasManagerAccess && (
            <Button 
              onClick={onAddShift}
              className="mt-4 px-5 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors active-touch-state"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Shift
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map(shift => (
            <Card 
              key={shift.id} 
              onClick={() => onShiftClick(shift)}
              className="border rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer active-touch-state"
            >
              <CardContent className="p-4">
                <h4 className="font-medium text-base mb-1">{shift.title || "Untitled Shift"}</h4>
                <p className="text-sm text-gray-600 mb-2">
                  {format(new Date(shift.start_time), 'h:mm a')} - {format(new Date(shift.end_time), 'h:mm a')}
                </p>
                {shift.employee_id && employees.find(e => e.id === shift.employee_id) && (
                  <div className="text-xs text-gray-500">
                    Assigned to: {employees.find(e => e.id === shift.employee_id)?.name}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MobileScheduleView;
