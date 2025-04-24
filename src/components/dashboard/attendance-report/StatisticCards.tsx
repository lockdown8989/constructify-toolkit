
import React from 'react';
import { Users, Calendar, Clock } from 'lucide-react';

interface StatisticCardsProps {
  present?: number;
  absent?: number;
  late?: number;
}

const StatisticCards: React.FC<StatisticCardsProps> = ({
  present = 0,
  absent = 0,
  late = 0,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-gray-800 rounded-xl p-3 flex items-center">
        <Users className="w-5 h-5 mr-3 text-green-400" />
        <div>
          <p className="text-xs text-gray-400">Present</p>
          <p className="text-lg font-semibold">{present}</p>
        </div>
      </div>
      <div className="bg-gray-800 rounded-xl p-3 flex items-center">
        <Calendar className="w-5 h-5 mr-3 text-red-400" />
        <div>
          <p className="text-xs text-gray-400">Absent</p>
          <p className="text-lg font-semibold">{absent}</p>
        </div>
      </div>
      <div className="bg-gray-800 rounded-xl p-3 flex items-center">
        <Clock className="w-5 h-5 mr-3 text-yellow-400" />
        <div>
          <p className="text-xs text-gray-400">Late</p>
          <p className="text-lg font-semibold">{late}</p>
        </div>
      </div>
    </div>
  );
};

export default StatisticCards;
