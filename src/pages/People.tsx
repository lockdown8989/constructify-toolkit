
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PeopleTable from '@/components/people/PeopleTable';
import { AlertCircle, Users } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEmployees, useEmployeeFilters, useAddEmployee, useUpdateEmployee } from '@/hooks/use-employees';
import { useToast } from '@/hooks/use-toast';
import { Employee } from '@/hooks/use-employees';
import AddEmployeeModal from '@/components/people/modals/AddEmployeeModal';
import PageHeader from '@/components/people/PageHeader';
import FilterSection from '@/components/people/FilterSection';
import ErrorDisplay from '@/components/people/ErrorDisplay';
import { useEmployeeData } from '@/components/people/useEmployeeData';

const People = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State for modal
  const [isAddPersonModalOpen, setIsAddPersonModalOpen] = useState(false);
  
  // State for filters and sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<{
    department?: string;
    site?: string;
    lifecycle?: string;
    status?: string;
  }>({});
  const [sortField, setSortField] = useState<keyof Employee>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Fetch employees with active filters
  const { 
    data: employees = [], 
    isLoading, 
    error 
  } = useEmployees(activeFilters);
  
  // Fetch filter options
  const { 
    data: filterOptions,
    isLoading: isLoadingFilters
  } = useEmployeeFilters();
  
  const updateEmployee = useUpdateEmployee();
  
  // Process employees with search and sort
  const processedEmployees = useEmployeeData(
    employees,
    searchQuery,
    sortField,
    sortDirection
  );
  
  // Handle adding new employee
  const handleAddPerson = () => {
    setIsAddPersonModalOpen(true);
  };
  
  // Handle updating employee status
  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateEmployee.mutateAsync({ id, status });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };
  
  // Handle filter changes
  const handleFilterChange = (key: string, value: string | undefined) => {
    setActiveFilters(prev => {
      if (!value) {
        const newFilters = { ...prev };
        delete newFilters[key as keyof typeof prev];
        return newFilters;
      }
      return { ...prev, [key]: value };
    });
  };
  
  // Clear all filters
  const clearFilters = () => {
    setActiveFilters({});
    setSearchQuery('');
  };
  
  if (error) {
    return <ErrorDisplay error={error as Error} />;
  }
  
  return (
    <div className="pt-20 md:pt-24 px-4 sm:px-6 pb-10 animate-fade-in">
      <div className="max-w-[1800px] mx-auto">
        <div className="flex items-center mb-8">
          <div className="bg-gradient-to-br from-apple-blue to-apple-indigo p-3 rounded-2xl mr-4 shadow-sm">
            <Users className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-apple-gray-900">My Employees</h1>
        </div>
        
        {/* Page Header with Add Person Button */}
        <PageHeader handleAddPerson={handleAddPerson} />
        
        {/* Filters and Search Section */}
        <div className="mb-8">
          <FilterSection 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeFilters={activeFilters}
            handleFilterChange={handleFilterChange}
            clearFilters={clearFilters}
            filterOptions={filterOptions}
            isLoadingFilters={isLoadingFilters}
            sortField={sortField}
            sortDirection={sortDirection}
            setSortField={setSortField}
            setSortDirection={setSortDirection}
          />
        </div>
        
        {/* People Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-apple-gray-200 overflow-hidden">
          <PeopleTable 
            employees={processedEmployees}
            isLoading={isLoading}
            onUpdateStatus={handleUpdateStatus}
          />
        </div>
        
        {/* Add Employee Modal */}
        <AddEmployeeModal
          open={isAddPersonModalOpen}
          onOpenChange={setIsAddPersonModalOpen}
          departments={filterOptions?.departments || []}
          sites={filterOptions?.sites || []}
        />
      </div>
    </div>
  );
};

export default People;
