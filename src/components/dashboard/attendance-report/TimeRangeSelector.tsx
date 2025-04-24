
import React from 'react';
import { cn } from '@/lib/utils';

interface TimeRangeSelectorProps {
  timeRange: number;
  onTimeRangeChange: (range: number) => void;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  timeRange,
  onTimeRangeChange,
}) => {
  return (
    <div className="flex space-x-2">
      <button 
        onClick={() => onTimeRangeChange(7)} 
        className={cn(
          "text-xs px-2 py-1 rounded-full transition-colors",
          timeRange === 7 ? "bg-white text-black" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
        )}
      >
        7d
      </button>
      <button 
        onClick={() => onTimeRangeChange(30)} 
        className={cn(
          "text-xs px-2 py-1 rounded-full transition-colors",
          timeRange === 30 ? "bg-white text-black" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
        )}
      >
        30d
      </button>
      <button 
        onClick={() => onTimeRangeChange(90)} 
        className={cn(
          "text-xs px-2 py-1 rounded-full transition-colors",
          timeRange === 90 ? "bg-white text-black" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
        )}
      >
        90d
      </button>
    </div>
  );
};

export default TimeRangeSelector;
