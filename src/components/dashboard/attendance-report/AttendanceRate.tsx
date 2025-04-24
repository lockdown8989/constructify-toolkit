
import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface AttendanceRateProps {
  rate: number;
}

const AttendanceRate: React.FC<AttendanceRateProps> = ({ rate }) => {
  return (
    <div className="flex items-end space-x-6 mb-6">
      <div>
        <p className="text-xs text-gray-400 mb-1">Attendance Rate</p>
        <span className="text-5xl font-semibold flex items-center">
          {rate}%
          {rate > 80 ? (
            <ChevronUp className="w-5 h-5 ml-2 text-green-400" />
          ) : (
            <ChevronDown className="w-5 h-5 ml-2 text-red-400" />
          )}
        </span>
      </div>
    </div>
  );
};

export default AttendanceRate;
