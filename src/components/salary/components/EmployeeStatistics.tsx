
import React from 'react';

interface StatisticsProps {
  holidayLeft: number;
  sickness: number;
}

const EmployeeStatistics: React.FC<StatisticsProps> = ({ holidayLeft, sickness }) => {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm">Holiday left</span>
          <span className="text-sm font-medium">{holidayLeft} days</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full">
          <div 
            className="h-full bg-amber-400 rounded-full" 
            style={{ width: `${(holidayLeft / 30) * 100}%` }}
          />
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm">Sickness</span>
          <span className="text-sm font-medium">{sickness} days</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full">
          <div 
            className="h-full bg-gray-800 rounded-full" 
            style={{ width: `${(sickness / 15) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default EmployeeStatistics;
