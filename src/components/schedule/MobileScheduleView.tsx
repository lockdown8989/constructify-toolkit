
import React from 'react';
import { Schedule } from '@/hooks/use-schedules';
import { Employee } from '@/types/restaurant-schedule';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAccessControl } from '@/hooks/leave/useAccessControl';

interface MobileScheduleViewProps {
  schedules: Schedule[];
  employees: Employee[];
  onAddShift: () => void;
  onShiftClick: (shift: any) => void;
}

const MobileScheduleView: React.FC<MobileScheduleViewProps> = ({
  schedules,
  employees,
  onAddShift,
  onShiftClick
}) => {
  const { hasManagerAccess } = useAccessControl();

  return (
    <div className="p-4">
      {hasManagerAccess && (
        <div className="mb-4">
          <Button 
            onClick={onAddShift}
            size="sm"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Shift
          </Button>
        </div>
      )}
      
      {schedules.length === 0 ? (
        <div className="text-center p-8 text-gray-500">
          <p>No shifts found for the selected period</p>
          {hasManagerAccess && (
            <Button 
              onClick={onAddShift}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Shift
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {schedules.map(shift => (
            <div 
              key={shift.id} 
              onClick={() => onShiftClick(shift)}
              className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <h4 className="font-medium">{shift.title || "Untitled Shift"}</h4>
              <p className="text-sm text-gray-500">
                {new Date(shift.start_time).toLocaleTimeString()} - {new Date(shift.end_time).toLocaleTimeString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MobileScheduleView;
