
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ActiveFilterPillsProps {
  activeFilters: {
    department?: string;
    site?: string;
    lifecycle?: string;
    status?: string;
  };
  handleFilterChange: (key: string, value: string | undefined) => void;
}

const ActiveFilterPills: React.FC<ActiveFilterPillsProps> = ({
  activeFilters,
  handleFilterChange,
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(activeFilters).map(([key, value]) => (
        <Badge 
          key={key} 
          variant="outline" 
          className="flex items-center gap-1 bg-gray-50"
          onClick={() => handleFilterChange(key, undefined)}
        >
          <span className="text-gray-500 text-xs">{key}:</span> {value}
          <button className="ml-1 text-gray-400 hover:text-gray-600">×</button>
        </Badge>
      ))}
    </div>
  );
};

export default ActiveFilterPills;
