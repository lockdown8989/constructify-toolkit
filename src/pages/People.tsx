import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PeopleTable from '@/components/people/PeopleTable';
import { AlertCircle, Users, Briefcase, Plus, Download, Filter } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEmployees, useEmployeeFilters, useAddEmployee, useUpdateEmployee } from '@/hooks/use-employees';
import { useToast } from '@/hooks/use-toast';
import { Employee } from '@/hooks/use-employees';
import AddEmployeeModal from '@/components/people/modals/AddEmployeeModal';
import PageHeader from '@/components/people/PageHeader';
import FilterSection from '@/components/people/FilterSection';
import ErrorDisplay from '@/components/people/ErrorDisplay';
import { useEmployeeData } from '@/components/people/useEmployeeData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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

  // Get active filter count
  const activeFilterCount = Object.keys(activeFilters).length + (searchQuery ? 1 : 0);
  
  if (error) {
    return <ErrorDisplay error={error as Error} />;
  }
  
  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30",
      isMobile ? "px-4 py-6" : "px-6 py-8"
    )}>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-2xl mr-4 shadow-lg">
              <Users className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Team Members
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Manage your team and their information
              </p>
            </div>
          </div>

          {/* Stats Cards - Mobile Friendly */}
          <div className={cn(
            "grid gap-4 mb-6",
            isMobile ? "grid-cols-2" : "grid-cols-4"
          )}>
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active</p>
                    <p className="text-2xl font-bold text-green-600">
                      {employees.filter(e => e.status === 'Active').length}
                    </p>
                  </div>
                  <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                </div>
              </CardContent>
            </Card>

            {!isMobile && (
              <>
                <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Departments</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {filterOptions?.departments?.length || 0}
                        </p>
                      </div>
                      <Briefcase className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Sites</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {filterOptions?.sites?.length || 0}
                        </p>
                      </div>
                      <div className="h-8 w-8 text-orange-600">🏢</div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Action Bar */}
          <div className={cn(
            "flex items-center justify-between bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-sm",
            isMobile && "flex-col space-y-3"
          )}>
            <div className="flex items-center space-x-3">
              <Button 
                onClick={handleAddPerson}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                size={isMobile ? "sm" : "default"}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
              
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} applied
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size={isMobile ? "sm" : "default"}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size={isMobile ? "sm" : "default"}>
                <Filter className="h-4 w-4 mr-2" />
                {isMobile ? "Filter" : "Advanced Filter"}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Filters Section */}
        <Card className="mb-6 bg-white/70 backdrop-blur-sm border-0 shadow-sm">
          <CardContent className="p-6">
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
          </CardContent>
        </Card>
        
        {/* Main Content */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <span>Team Directory</span>
              <Badge variant="outline" className="bg-gray-100">
                {processedEmployees.length} member{processedEmployees.length !== 1 ? 's' : ''}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isMobile ? (
              <ScrollArea className="h-[calc(100vh-400px)] rounded-b-2xl">
                <PeopleTable 
                  employees={processedEmployees}
                  isLoading={isLoading}
                  onUpdateStatus={handleUpdateStatus}
                />
              </ScrollArea>
            ) : (
              <div className="max-h-[calc(100vh-300px)] overflow-auto rounded-b-2xl">
                <PeopleTable 
                  employees={processedEmployees}
                  isLoading={isLoading}
                  onUpdateStatus={handleUpdateStatus}
                />
              </div>
            )}
          </CardContent>
        </Card>
        
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
