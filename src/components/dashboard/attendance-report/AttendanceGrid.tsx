
import React from 'react';
import { cn } from '@/lib/utils';

interface AttendanceGridProps {
  present: number;
  absent: number;
  late: number;
  total: number;
}

const AttendanceGrid: React.FC<AttendanceGridProps> = ({
  present,
  absent,
  late,
  total,
}) => {
  const generateGrid = () => {
    const totalCells = 48;
    const presentPercentage = total ? present / total : 0;
    const absentPercentage = total ? absent / total : 0;
    const latePercentage = total ? late / total : 0;
    
    const presentCells = Math.round(totalCells * presentPercentage);
    const absentCells = Math.round(totalCells * absentPercentage);
    const lateCells = Math.round(totalCells * latePercentage);
    
    return Array.from({ length: totalCells }).map((_, index) => {
      if (index < presentCells) return 'present';
      if (index < presentCells + absentCells) return 'absent';
      if (index < presentCells + absentCells + lateCells) return 'late';
      return 'empty';
    });
  };

  const grid = generateGrid();

  return (
    <>
      <p className="text-xs text-gray-400 mb-2">Attendance Distribution</p>
      <div className="grid grid-cols-8 gap-2">
        {grid.map((type, index) => (
          <div 
            key={index}
            className={cn(
              "w-5 h-5 rounded-full transition-all duration-300 animate-fade-in",
              type === 'present' && "bg-green-400",
              type === 'absent' && "bg-red-400/60",
              type === 'late' && "bg-yellow-400/80",
              type === 'empty' && "bg-gray-800"
            )}
            style={{ animationDelay: `${index * 10}ms` }}
          />
        ))}
      </div>
      
      <div className="mt-4 flex items-center text-xs text-gray-400 space-x-4">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-400 mr-2"></div>
          <span>Present</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-400/60 mr-2"></div>
          <span>Absent</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-yellow-400/80 mr-2"></div>
          <span>Late</span>
        </div>
      </div>
    </>
  );
};

export default AttendanceGrid;
