
import React from 'react';
import { PlusCircle, Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ViewType } from '../types/calendar-types';

interface ShiftCalendarToolbarProps {
  view: ViewType;
  onChangeView: (view: ViewType) => void;
  onAddShift?: () => void;
  isManager?: boolean;
  showFilter?: boolean;
  onShowFilters?: () => void;
}

const ShiftCalendarToolbar: React.FC<ShiftCalendarToolbarProps> = ({
  view,
  onChangeView,
  onAddShift,
  isManager = false,
  showFilter = false,
  onShowFilters
}) => {
  return (
    <div className="flex items-center justify-between border-b p-2">
      <Tabs 
        value={view} 
        onValueChange={(value) => onChangeView(value as ViewType)}
        className="w-auto"
      >
        <TabsList>
          <TabsTrigger value="day">Day</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="flex items-center gap-2">
        {showFilter && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={onShowFilters}
            className="flex items-center gap-1"
          >
            <Filter className="h-4 w-4" />
            <span className="sr-md:inline hidden">Filter</span>
          </Button>
        )}
        
        {isManager && onAddShift && (
          <Button
            size="sm"
            onClick={onAddShift}
            className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600"
          >
            <PlusCircle className="h-4 w-4" />
            <span className="sr-md:inline hidden">Add Shift</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default ShiftCalendarToolbar;
