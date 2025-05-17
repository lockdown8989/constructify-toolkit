
import React from 'react';
import { Schedule } from '@/hooks/use-schedules';
import { Employee } from '@/types/restaurant-schedule';

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
  return (
    <div className="p-4">
      {schedules.length === 0 ? (
        <div className="text-center p-8 text-gray-500">
          <p>No shifts found for the selected period</p>
          <button 
            onClick={onAddShift}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Add Shift
          </button>
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
