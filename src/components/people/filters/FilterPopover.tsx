
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
  const hasActiveFilters = Object.values(activeFilters).some(filter => filter !== undefined);
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`flex items-center gap-2 border rounded-full px-4 py-2.5 ${hasActiveFilters ? "border-apple-blue bg-apple-blue/5 text-apple-blue hover:bg-apple-blue/10" : "border-apple-gray-200 hover:bg-apple-gray-50 text-apple-gray-700"}`}
        >
          <Filter className="h-4 w-4" />
          <span>Filter</span>
          {hasActiveFilters && (
            <span className="flex items-center justify-center bg-apple-blue text-white rounded-full text-xs w-5 h-5 font-medium">
              {Object.keys(activeFilters).filter(key => activeFilters[key as keyof typeof activeFilters] !== undefined).length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-4 rounded-2xl shadow-lg border-apple-gray-200">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm text-apple-gray-900">Filters</h4>
            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="h-auto py-1.5 px-2.5 text-xs text-apple-blue hover:bg-apple-blue/5 rounded-full"
              >
                Clear all
              </Button>
            )}
          </div>
          
          <Separator />
          
          {isLoadingFilters ? (
            <div className="py-6 text-center text-apple-gray-500 text-sm">
              Loading filters...
            </div>
          ) : (
            <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-2">
              {filterOptions && (
                <>
                  <FilterGroup 
                    label="Department"
                    options={filterOptions.departments}
                    value={activeFilters.department}
                    onChange={(value) => handleFilterChange('department', value)}
                    isLoading={isLoadingFilters}
                    placeholder="All departments"
                  />
                  
                  <FilterGroup 
                    label="Site"
                    options={filterOptions.sites}
                    value={activeFilters.site}
                    onChange={(value) => handleFilterChange('site', value)}
                    isLoading={isLoadingFilters}
                    placeholder="All sites"
                  />
                  
                  <FilterGroup 
                    label="Lifecycle"
                    options={filterOptions.lifecycles}
                    value={activeFilters.lifecycle}
                    onChange={(value) => handleFilterChange('lifecycle', value)}
                    isLoading={isLoadingFilters}
                    placeholder="All lifecycles"
                  />
                  
                  <FilterGroup 
                    label="Status"
                    options={filterOptions.statuses}
                    value={activeFilters.status}
                    onChange={(value) => handleFilterChange('status', value)}
                    isLoading={isLoadingFilters}
                    placeholder="All statuses"
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
