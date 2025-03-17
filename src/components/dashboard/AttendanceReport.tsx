
import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';

interface AttendanceReportProps {
  present: number;
  absent: number;
  className?: string;
}

const AttendanceReport: React.FC<AttendanceReportProps> = ({ 
  present, 
  absent,
  className 
}) => {
  // Generate grid data (6x8 grid)
  const generateGrid = () => {
    const totalCells = 48; // 6x8 grid
    const filledCells = Math.min(present + absent, totalCells);
    const presentCells = Math.min(present, filledCells);
    
    return Array.from({ length: totalCells }).map((_, index) => {
      if (index < presentCells) {
        return 'present';
      } else if (index < filledCells) {
        return 'absent';
      }
      return 'empty';
    });
  };
  
  const grid = generateGrid();
  
  return (
    <div className={cn(
      "bg-gray-900 text-white rounded-3xl p-6 card-shadow overflow-hidden relative", 
      className
    )}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-medium">Attendance Report</h3>
        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex items-end space-x-6 mb-8">
        <div>
          <span className="text-5xl font-semibold flex items-center">
            {present}
            <ChevronUp className="w-5 h-5 ml-2 text-crextio-accent" />
          </span>
        </div>
        <div>
          <span className="text-4xl font-medium text-gray-400 flex items-center">
            {absent}
            <ChevronDown className="w-5 h-5 ml-2 text-gray-500" />
          </span>
        </div>
      </div>
      
      {/* Attendance Grid */}
      <div className="grid grid-cols-8 gap-2">
        {grid.map((type, index) => (
          <div 
            key={index}
            className={cn(
              "w-5 h-5 rounded-full transition-all duration-300 animate-fade-in",
              type === 'present' && "bg-crextio-accent",
              type === 'absent' && "bg-white/20",
              type === 'empty' && "bg-gray-800"
            )}
            style={{ animationDelay: `${index * 10}ms` }}
          />
        ))}
      </div>
      
      {/* Decorative elements */}
      <div className="absolute bottom-0 right-0 w-20 h-20 bg-crextio-accent/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute top-10 left-10 w-10 h-10 bg-crextio-accent/10 rounded-full blur-xl pointer-events-none" />
    </div>
  );
};

export default AttendanceReport;
