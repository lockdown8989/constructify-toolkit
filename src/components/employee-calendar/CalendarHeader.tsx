
import React from 'react';
import { CalendarIcon, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ViewMode } from './types';
import { useIsMobile } from '@/hooks/use-mobile';

interface CalendarHeaderProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onAddEvent: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  viewMode,
  setViewMode,
  searchQuery,
  setSearchQuery,
  onAddEvent
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="p-4 border-b flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center">
        <CalendarIcon className="mr-2 h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold">Employee Calendar</h1>
      </div>
      
      <div className="flex items-center gap-2">
        {!isMobile && (
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search events..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
        
        <Button 
          variant={viewMode === 'day' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('day')}
          className="h-9"
        >
          Day
        </Button>
        
        <Button 
          variant={viewMode === 'week' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('week')}
          className="h-9"
        >
          Week
        </Button>
        
        <Button 
          variant="default"
          size="sm"
          className="bg-primary text-white h-9"
          onClick={onAddEvent}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Event
        </Button>
      </div>
    </div>
  );
};

export default CalendarHeader;
