
import React, { useState } from 'react';
import { Calendar, Filter, Menu, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ViewType } from '@/components/schedule/types/calendar-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';
import { ViewMode } from '@/types/restaurant-schedule';
import LocationSelector from './LocationSelector';

interface ScheduleHeaderProps {
  locationName: string;
  setLocationName: (name: string) => void;
  viewType?: ViewType;
  onSearch?: (query: string) => void;
  searchQuery?: string;
  weekView?: boolean;
  setWeekView?: (view: boolean) => void;
  setViewMode?: (viewMode: ViewMode) => void;
  onSyncCalendar?: () => void;
  onSyncEmployeeData?: () => void;
  isSyncing?: boolean;
}

const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({ 
  locationName, 
  setLocationName,
  viewType = 'day',
  onSearch,
  searchQuery = '',
  weekView = true,
  setWeekView,
  setViewMode,
  onSyncCalendar,
  onSyncEmployeeData,
  isSyncing = false
}) => {
  const isMobile = useIsMobile();
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setLocalSearchQuery(newQuery);
    if (onSearch) {
      onSearch(newQuery);
    }
  };
  
  const toggleView = () => {
    if (setWeekView) {
      setWeekView(!weekView);
    }
  };

  return (
    <div className="flex flex-col bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 p-3 sm:p-4">
        <div className="flex items-center">
          <Calendar className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-gray-600" />
          <h1 className="text-lg sm:text-xl font-semibold">Schedule</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          {setWeekView && (
            <Button 
              variant="ghost" 
              size={isMobile ? "sm" : "default"} 
              onClick={toggleView} 
              className="hidden sm:flex items-center gap-2"
            >
              <span>{weekView ? "This Week" : "Today"}</span>
            </Button>
          )}
          
          {onSyncCalendar && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onSyncCalendar} 
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
              disabled={isSyncing}
            >
              <Filter className="h-5 w-5" />
            </Button>
          )}
          
          <div className="relative">
            <Button variant="ghost" size="sm" className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
              <Menu className="h-5 w-5" />
            </Button>
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-1 flex items-center justify-center bg-red-500 text-white text-xs rounded-full">
              3
            </Badge>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center p-3 sm:p-4 gap-3 border-b border-gray-200">
        <div className="flex items-center flex-grow">
          <span className="text-gray-500 mr-2 hidden sm:inline">Location:</span>
          <LocationSelector 
            locationName={locationName}
            setLocationName={setLocationName}
          />
        </div>
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search employees..."
            className="pl-9 rounded-full border-gray-200"
            value={localSearchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>
    </div>
  );
};

export default ScheduleHeader;
