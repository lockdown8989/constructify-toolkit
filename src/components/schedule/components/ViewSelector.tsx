
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, CalendarDays, List } from 'lucide-react';

export type ViewType = 'day' | 'week' | 'month' | 'list';

interface ViewSelectorProps {
  view: ViewType;
  onChange: (view: ViewType) => void;
}

const ViewSelector: React.FC<ViewSelectorProps> = ({ view, onChange }) => {
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      <Button
        variant={view === 'day' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('day')}
        className="h-8 px-3"
      >
        Daily
      </Button>
      <Button
        variant={view === 'week' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('week')}
        className="h-8 px-3"
      >
        Weekly
      </Button>
      <Button
        variant={view === 'month' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('month')}
        className="h-8 px-3"
      >
        Monthly
      </Button>
      <Button
        variant={view === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('list')}
        className="h-8 px-3 flex items-center gap-1"
      >
        <List className="h-3 w-3" />
        List
      </Button>
    </div>
  );
};

export default ViewSelector;
