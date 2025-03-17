import React, { useState } from 'react';
import PeopleTable from '@/components/people/PeopleTable';
import { Plus, Search, AlertCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEmployees, useAddEmployee, useUpdateEmployee } from '@/hooks/use-employees';
import { useToast } from '@/hooks/use-toast';

const People = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { data: employees = [], isLoading, error } = useEmployees();
  const addEmployee = useAddEmployee();
  const updateEmployee = useUpdateEmployee();
  
  const [searchQuery, setSearchQuery] = useState('');
  
  // Transform database data to match the component's expected format
  const formattedEmployees = employees.map(employee => ({
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
  
  const filteredEmployees = formattedEmployees.filter(employee => 
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleAddPerson = () => {
    toast({
      title: "This feature is coming soon",
      description: "The ability to add new employees will be available in a future update.",
    });
  };
  
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
            <h1 className="text-2xl md:text-4xl font-bold mb-1">People</h1>
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
        
        {/* Search - Mobile Only */}
        {isMobile && (
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-full bg-gray-100 text-sm w-full focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>
        )}
        
        {/* People Table */}
        <PeopleTable 
          employees={filteredEmployees}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default People;
