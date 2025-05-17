
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Calendar, CalendarDays, CalendarRange } from 'lucide-react';

export type ViewType = 'day' | 'week' | 'month';

interface ViewSelectorProps {
  view: ViewType;
  onChange: (view: ViewType) => void;
}

const ViewSelector: React.FC<ViewSelectorProps> = ({ view, onChange }) => {
  return (
    <div className="flex rounded-md border p-1 bg-white shadow-sm">
      <Button
        type="button"
        variant={view === 'day' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('day')}
        className={cn(
          "rounded-sm transition-colors duration-200", 
          view !== 'day' && "hover:bg-muted/30",
          view === 'day' && "animate-scale-in"
        )}
      >
        <Calendar className="h-4 w-4 mr-1" />
        <span>Daily</span>
      </Button>
      <Button
        type="button"
        variant={view === 'week' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('week')}
        className={cn(
          "rounded-sm transition-colors duration-200", 
          view !== 'week' && "hover:bg-muted/30",
          view === 'week' && "animate-scale-in"
        )}
      >
        <CalendarDays className="h-4 w-4 mr-1" />
        <span>Weekly</span>
      </Button>
      <Button
        type="button"
        variant={view === 'month' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('month')}
        className={cn(
          "rounded-sm transition-colors duration-200", 
          view !== 'month' && "hover:bg-muted/30",
          view === 'month' && "animate-scale-in"
        )}
      >
        <CalendarRange className="h-4 w-4 mr-1" />
        <span>Monthly</span>
      </Button>
    </div>
  );
};

export default ViewSelector;
