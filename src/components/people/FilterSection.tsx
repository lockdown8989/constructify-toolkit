
import React from 'react';
import SearchBar from './SearchBar';
import FilterPopover from './filters/FilterPopover';
import ActiveFilterPills from './filters/ActiveFilterPills';
import SortControl from './filters/SortControl';
import { Employee } from '@/hooks/use-employees';

interface FilterSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeFilters: {
    department?: string;
    site?: string;
    lifecycle?: string;
    status?: string;
  };
  handleFilterChange: (key: string, value: string | undefined) => void;
  clearFilters: () => void;
  filterOptions: {
    departments: string[];
    sites: string[];
    lifecycles: string[];
    statuses: string[];
  } | undefined;
  isLoadingFilters: boolean;
  sortField: keyof Employee;
  sortDirection: 'asc' | 'desc';
  setSortField: (field: keyof Employee) => void;
  setSortDirection: (direction: 'asc' | 'desc') => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  searchQuery,
  setSearchQuery,
  activeFilters,
  handleFilterChange,
  clearFilters,
  filterOptions,
  isLoadingFilters,
  sortField,
  sortDirection,
  setSortField,
  setSortDirection,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      {/* Search - Both Mobile and Desktop */}
      <SearchBar 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
      />
      
      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
        {/* Filter Popover */}
        <FilterPopover 
          activeFilters={activeFilters}
          filterOptions={filterOptions}
          handleFilterChange={handleFilterChange}
          clearFilters={clearFilters}
          isLoadingFilters={isLoadingFilters}
        />
        
        {/* Active Filter Pills */}
        <ActiveFilterPills 
          activeFilters={activeFilters}
          handleFilterChange={handleFilterChange}
        />
        
        {/* Sort Control */}
        <SortControl 
          sortField={sortField}
          sortDirection={sortDirection}
          setSortField={setSortField}
          setSortDirection={setSortDirection}
        />
      </div>
    </div>
  );
};

export default FilterSection;
