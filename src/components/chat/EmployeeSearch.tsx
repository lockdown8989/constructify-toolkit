
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Employee {
  id: string;
  name: string;
  avatar_url?: string;
  department?: string;
  job_title?: string;
  user_id?: string;
}

interface EmployeeSearchProps {
  onEmployeeSelect: (employeeId: string) => void;
  onBack: () => void;
}

export const EmployeeSearch: React.FC<EmployeeSearchProps> = ({
  onEmployeeSelect,
  onBack,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoading(true);
        console.log('EmployeeSearch: Fetching employees');
        
        const { data, error } = await supabase
          .from('employees')
          .select('id, name, avatar_url, department, job_title, user_id')
          .eq('status', 'Active')
          .order('name');

        if (error) {
          console.error('EmployeeSearch: Error fetching employees:', error);
          throw error;
        }

        console.log('EmployeeSearch: Employees fetched:', data);
        setEmployees(data || []);
        setFilteredEmployees(data || []);
      } catch (error) {
        console.error('Error fetching employees:', error);
        toast.error('Failed to load employees');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Filter employees based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredEmployees(employees);
      return;
    }

    const filtered = employees.filter(employee =>
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.job_title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setFilteredEmployees(filtered);
  }, [searchQuery, employees]);

  const handleEmployeeSelect = (employee: Employee) => {
    console.log('EmployeeSearch: Employee selected:', employee);
    onEmployeeSelect(employee.id);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-1 h-auto"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h3 className="font-semibold">Select Employee</h3>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Employee List */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading employees...</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {searchQuery ? 'No employees found matching your search' : 'No employees available'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredEmployees.map((employee) => (
              <Button
                key={employee.id}
                onClick={() => handleEmployeeSelect(employee)}
                className="w-full p-4 h-auto justify-start bg-muted/50 hover:bg-muted text-left"
                variant="ghost"
              >
                <div className="flex items-center gap-3 w-full">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={employee.avatar_url} alt={employee.name} />
                    <AvatarFallback className="text-sm">
                      {employee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{employee.name}</div>
                    <div className="text-sm text-muted-foreground truncate">
                      {employee.job_title}
                      {employee.department && ` • ${employee.department}`}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
