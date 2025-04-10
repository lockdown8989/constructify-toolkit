
import React from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from '@/components/ui/separator';
import FilterGroup from './FilterGroup';

interface FilterPopoverProps {
  activeFilters: {
    department?: string;
    site?: string;
    lifecycle?: string;
    status?: string;
  };
  filterOptions: {
    departments: string[];
    sites: string[];
    lifecycles: string[];
    statuses: string[];
  } | undefined;
  handleFilterChange: (key: string, value: string | undefined) => void;
  clearFilters: () => void;
  isLoadingFilters: boolean;
}

const FilterPopover: React.FC<FilterPopoverProps> = ({
  activeFilters,
  filterOptions,
  handleFilterChange,
  clearFilters,
  isLoadingFilters,
}) => {
  const activeFilterCount = Object.keys(activeFilters).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2 bg-gray-200">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Filters</h4>
            <Button variant="ghost" size="sm" onClick={clearFilters} disabled={activeFilterCount === 0}>
              Clear all
            </Button>
          </div>
          
          <Separator />
          
          <FilterGroup 
            label="Department"
            options={filterOptions?.departments || []}
            value={activeFilters.department}
            onChange={(value) => handleFilterChange('department', value)}
            isLoading={isLoadingFilters}
            placeholder="All departments"
          />
          
          <FilterGroup 
            label="Site"
            options={filterOptions?.sites || []}
            value={activeFilters.site}
            onChange={(value) => handleFilterChange('site', value)}
            isLoading={isLoadingFilters}
            placeholder="All locations"
          />
          
          <FilterGroup 
            label="Lifecycle"
            options={filterOptions?.lifecycles || []}
            value={activeFilters.lifecycle}
            onChange={(value) => handleFilterChange('lifecycle', value)}
            isLoading={isLoadingFilters}
            placeholder="All lifecycles"
          />
          
          <FilterGroup 
            label="Status"
            options={filterOptions?.statuses || []}
            value={activeFilters.status}
            onChange={(value) => handleFilterChange('status', value)}
            isLoading={isLoadingFilters}
            placeholder="All statuses"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default FilterPopover;
