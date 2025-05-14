
import React from 'react';
import { ChevronDown, Calendar, Filter, Menu } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ViewType } from '../types/calendar-types';

interface ShiftCalendarHeaderProps {
  locationName: string;
  setLocationName: (name: string) => void;
  viewType?: ViewType;
}

const ShiftCalendarHeader: React.FC<ShiftCalendarHeaderProps> = ({ 
  locationName, 
  setLocationName,
  viewType = 'day'
}) => {
  return (
    <div className="flex items-center justify-between border-b border-gray-200 p-4">
      <div className="flex items-center">
        <span className="text-gray-600 mr-2">📍</span>
        <h1 className="text-xl font-semibold">{locationName}</h1>
        <ChevronDown className="h-5 w-5 ml-2 text-gray-500" />
      </div>
      
      <div className="flex items-center space-x-2">
        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
          <Calendar className="h-6 w-6" />
        </button>
        
        <div className="relative">
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <Filter className="h-6 w-6" />
          </button>
          <div className="absolute -top-1 -right-1 h-3 w-3 bg-blue-500 rounded-full"></div>
        </div>
        
        <div className="relative">
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <Menu className="h-6 w-6" />
          </button>
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-1 flex items-center justify-center bg-red-500 text-white text-xs rounded-full">
            5
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default ShiftCalendarHeader;
