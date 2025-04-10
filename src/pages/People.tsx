
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PeopleTable from '@/components/people/PeopleTable';
import { Plus, Search, AlertCircle, Filter } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEmployees, useEmployeeFilters, useAddEmployee, useUpdateEmployee } from '@/hooks/use-employees';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import AddEmployeeModal from '@/components/people/modals/AddEmployeeModal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Employee } from '@/hooks/use-employees';

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
  
  // Derived state: Sort and filter employees
  const processedEmployees = React.useMemo(() => {
    // First apply search filter
    let filtered = employees.filter(employee => {
      const query = searchQuery.toLowerCase();
      return (
        employee.name.toLowerCase().includes(query) ||
        employee.job_title.toLowerCase().includes(query) ||
        employee.department.toLowerCase().includes(query) ||
        employee.site.toLowerCase().includes(query) ||
        employee.lifecycle.toLowerCase().includes(query) ||
        employee.status.toLowerCase().includes(query) ||
        employee.salary.toString().includes(query) ||
        new Date(employee.start_date).toLocaleDateString().includes(query)
      );
    });
    
    // Then sort
    filtered.sort((a, b) => {
      const fieldA = a[sortField];
      const fieldB = b[sortField];
      
      if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        return sortDirection === 'asc' 
          ? fieldA.localeCompare(fieldB)
          : fieldB.localeCompare(fieldA);
      }
      
      if (typeof fieldA === 'number' && typeof fieldB === 'number') {
        return sortDirection === 'asc' 
          ? fieldA - fieldB
          : fieldB - fieldA;
      }
      
      // Handle dates
      if (sortField === 'start_date') {
        const dateA = new Date(a.start_date);
        const dateB = new Date(b.start_date);
        return sortDirection === 'asc' 
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      }
      
      return 0;
    });
    
    return filtered.map(employee => ({
      id: employee.id,
      avatar: employee.avatar || `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'women' : 'men'}/${Math.floor(Math.random() * 99)}.jpg`,
      name: employee.name,
      jobTitle: employee.job_title,
      department: employee.department,
      site: employee.site,
      siteIcon: employee.site.includes('Remote') ? '🌐' : '🏢',
      salary: `$${employee.salary.toLocaleString()}`,
      startDate: new Date(employee.start_date).toLocaleDateString('en-US', { 
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      lifecycle: employee.lifecycle,
      status: employee.status,
      statusColor: employee.status === 'Active' ? 'green' as const : 'gray' as const,
    }));
  }, [employees, searchQuery, sortField, sortDirection]);
  
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
  
  // Count active filters
  const activeFilterCount = Object.keys(activeFilters).length;
  
  if (error) {
    return (
      <div className="pt-20 md:pt-24 px-4 sm:px-6 pb-10 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-center text-red-700">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>Error loading employees: {(error as Error).message}</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="pt-20 md:pt-24 px-4 sm:px-6 pb-10 animate-fade-in">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-1">My Employees</h1>
            <p className="text-gray-500">Manage your team members and their account permissions here</p>
          </div>
          
          <button 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors self-start sm:self-center"
            onClick={handleAddPerson}
          >
            <Plus className="w-4 h-4 mr-2" />
            <span>Add person</span>
          </button>
        </div>
        
        {/* Filters and Search Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          {/* Search - Both Mobile and Desktop */}
          <div className="relative w-full md:w-auto md:min-w-[280px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-md bg-gray-100 text-sm w-full focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
            {/* Filter Popover */}
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
                  
                  {/* Department Filter */}
                  <div className="space-y-2">
                    <label htmlFor="department-filter" className="text-sm font-medium">
                      Department
                    </label>
                    <Select 
                      value={activeFilters.department} 
                      onValueChange={(value) => handleFilterChange('department', value)}
                    >
                      <SelectTrigger id="department-filter">
                        <SelectValue placeholder="All departments" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All departments</SelectItem>
                        {filterOptions?.departments.map(dept => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Site Filter */}
                  <div className="space-y-2">
                    <label htmlFor="site-filter" className="text-sm font-medium">
                      Site
                    </label>
                    <Select 
                      value={activeFilters.site} 
                      onValueChange={(value) => handleFilterChange('site', value)}
                    >
                      <SelectTrigger id="site-filter">
                        <SelectValue placeholder="All locations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All locations</SelectItem>
                        {filterOptions?.sites.map(site => (
                          <SelectItem key={site} value={site}>{site}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Lifecycle Filter */}
                  <div className="space-y-2">
                    <label htmlFor="lifecycle-filter" className="text-sm font-medium">
                      Lifecycle
                    </label>
                    <Select 
                      value={activeFilters.lifecycle} 
                      onValueChange={(value) => handleFilterChange('lifecycle', value)}
                    >
                      <SelectTrigger id="lifecycle-filter">
                        <SelectValue placeholder="All lifecycles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All lifecycles</SelectItem>
                        {filterOptions?.lifecycles.map(lifecycle => (
                          <SelectItem key={lifecycle} value={lifecycle}>{lifecycle}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Status Filter */}
                  <div className="space-y-2">
                    <label htmlFor="status-filter" className="text-sm font-medium">
                      Status
                    </label>
                    <Select 
                      value={activeFilters.status} 
                      onValueChange={(value) => handleFilterChange('status', value)}
                    >
                      <SelectTrigger id="status-filter">
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All statuses</SelectItem>
                        {filterOptions?.statuses.map(status => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            {/* Active Filter Pills */}
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
            
            {/* Sort Control */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-gray-500">Sort by:</span>
              <Select 
                value={sortField} 
                onValueChange={(value) => setSortField(value as keyof Employee)}
              >
                <SelectTrigger className="h-9 min-w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="job_title">Job Title</SelectItem>
                  <SelectItem value="department">Department</SelectItem>
                  <SelectItem value="site">Site</SelectItem>
                  <SelectItem value="salary">Salary</SelectItem>
                  <SelectItem value="start_date">Start Date</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9"
                onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
              >
                {sortDirection === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>
        </div>
        
        {/* People Table */}
        <PeopleTable 
          employees={processedEmployees}
          isLoading={isLoading}
          onUpdateStatus={handleUpdateStatus}
        />
        
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
