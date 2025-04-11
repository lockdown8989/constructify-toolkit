
import React from 'react';
import { Filter } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import FilterGroup from './FilterGroup';
import { Separator } from '@/components/ui/separator';

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
  const hasActiveFilters = Object.keys(activeFilters).length > 0;
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`flex items-center gap-2 border rounded-xl px-3 py-2 ${hasActiveFilters ? "border-apple-blue bg-apple-blue/5 text-apple-blue hover:bg-apple-blue/10" : "border-apple-gray-200 hover:bg-apple-gray-50 text-apple-gray-700"}`}
        >
          <Filter className="h-4 w-4" />
          <span>Filter</span>
          {hasActiveFilters && (
            <span className="flex items-center justify-center bg-apple-blue text-white rounded-full text-xs w-5 h-5 font-medium">
              {Object.keys(activeFilters).length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-3 rounded-xl shadow-lg border-apple-gray-200">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm text-apple-gray-900">Filters</h4>
            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="h-auto py-1 px-2 text-xs text-apple-blue hover:bg-apple-blue/5"
              >
                Clear all
              </Button>
            )}
          </div>
          
          <Separator />
          
          {isLoadingFilters ? (
            <div className="py-4 text-center text-apple-gray-500 text-sm">
              Loading filters...
            </div>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {filterOptions && (
                <>
                  <FilterGroup 
                    title="Department" 
                    options={filterOptions.departments}
                    selected={activeFilters.department}
                    onChange={(value) => handleFilterChange('department', value)}
                  />
                  
                  <FilterGroup 
                    title="Site" 
                    options={filterOptions.sites}
                    selected={activeFilters.site}
                    onChange={(value) => handleFilterChange('site', value)}
                  />
                  
                  <FilterGroup 
                    title="Lifecycle" 
                    options={filterOptions.lifecycles}
                    selected={activeFilters.lifecycle}
                    onChange={(value) => handleFilterChange('lifecycle', value)}
                  />
                  
                  <FilterGroup 
                    title="Status" 
                    options={filterOptions.statuses}
                    selected={activeFilters.status}
                    onChange={(value) => handleFilterChange('status', value)}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default FilterPopover;
