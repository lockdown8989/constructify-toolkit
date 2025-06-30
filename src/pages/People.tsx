import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PeopleTable from '@/components/people/PeopleTable';
import { AlertCircle, Users, Briefcase, Trash2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEmployees, useEmployeeFilters, useAddEmployee, useUpdateEmployee } from '@/hooks/use-employees';
import { useToast } from '@/hooks/use-toast';
import { Employee } from '@/hooks/use-employees';
import AddEmployeeModal from '@/components/people/modals/AddEmployeeModal';
import PageHeader from '@/components/people/PageHeader';
import FilterSection from '@/components/people/FilterSection';
import ErrorDisplay from '@/components/people/ErrorDisplay';
import { useEmployeeData } from '@/components/people/useEmployeeData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cleanupExampleEmployees } from '@/utils/employee-cleanup';
import { useAuth } from '@/hooks/use-auth';

const People = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isManager, isPayroll, isAdmin } = useAuth();
  
  // State for modal
  const [isAddPersonModalOpen, setIsAddPersonModalOpen] = useState(false);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  
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
    error,
    refetch
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

  // More aggressive auto-cleanup for payroll users
  useEffect(() => {
    if (isPayroll && !isLoading) {
      const autoCleanup = async () => {
        console.log('Payroll user detected - running aggressive cleanup...');
        const result = await cleanupExampleEmployees();
        if (result.success) {
          if (result.cleanedCount > 0) {
            toast({
              title: "Example Employees Removed",
              description: `Cleaned up ${result.cleanedCount} example employees. Real employee data synchronized.`
            });
          } else {
            toast({
              title: "Data Synchronized",
              description: "Employee data synchronized with manager accounts."
            });
          }
          refetch();
        }
      };
      
      const timer = setTimeout(autoCleanup, 1000);
      return () => clearTimeout(timer);
    }
  }, [isPayroll, isLoading, refetch, toast]);

  // Regular auto-cleanup for manager/admin users
  useEffect(() => {
    if ((isManager || isAdmin) && employees.length === 0 && !isLoading) {
      const autoCleanup = async () => {
        console.log('Auto-cleaning example employees...');
        const result = await cleanupExampleEmployees();
        if (result.success && result.cleanedCount > 0) {
          toast({
            title: "Cleanup Complete",
            description: `Removed ${result.cleanedCount} example employees from the system.`
          });
          refetch();
        }
      };
      
      const timer = setTimeout(autoCleanup, 2000);
      return () => clearTimeout(timer);
    }
  }, [employees.length, isLoading, isManager, isAdmin, refetch, toast]);
  
  // Handle manual cleanup
  const handleCleanupExamples = async () => {
    setIsCleaningUp(true);
    try {
      const result = await cleanupExampleEmployees();
      if (result.success) {
        toast({
          title: "Cleanup Complete",
          description: result.cleanedCount > 0 
            ? `Removed ${result.cleanedCount} example employees.`
            : "No example employees found to remove."
        });
        refetch();
      } else {
        toast({
          title: "Cleanup Failed",
          description: result.error || "Failed to cleanup example employees.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Cleanup Error",
        description: "An error occurred during cleanup.",
        variant: "destructive"
      });
    } finally {
      setIsCleaningUp(false);
    }
  };
  
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-2xl mr-4 shadow-sm">
              <Briefcase className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-apple-gray-900">Team Members</h1>
              <p className="text-apple-gray-500 text-sm mt-1">Manage your team and their permissions</p>
            </div>
          </div>
          
          {/* Cleanup button for admins/managers/payroll */}
          {(isManager || isPayroll || isAdmin) && (
            <Button
              onClick={handleCleanupExamples}
              disabled={isCleaningUp}
              variant="outline"
              className="ml-4"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isCleaningUp ? "Syncing..." : "Sync Data"}
            </Button>
          )}
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
        <Card className="overflow-hidden border-apple-gray-200 shadow-sm">
          <CardContent className="p-0">
            <PeopleTable 
              employees={processedEmployees}
              isLoading={isLoading}
              onUpdateStatus={handleUpdateStatus}
            />
          </CardContent>
        </Card>
        
        {/* Add Employee Modal */}
        <AddEmployeeModal
          isOpen={isAddPersonModalOpen}
          onClose={() => setIsAddPersonModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default People;
