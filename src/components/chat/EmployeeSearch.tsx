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
  job_title: string;
  department: string;
  avatar_url?: string;
  user_id: string;
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

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = employees.filter(employee =>
        employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.job_title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredEmployees(filtered);
    } else {
      setFilteredEmployees(employees);
    }
  }, [searchQuery, employees]);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('employees')
        .select('id, name, job_title, department, avatar_url, user_id')
        .eq('status', 'Active')
        .not('user_id', 'is', null)
        .order('name');

      if (error) throw error;
      setEmployees(data || []);
      setFilteredEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search Header */}
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-1 h-auto"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h3 className="font-semibold text-sm">Start New Chat</h3>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search employees..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Employee List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p className="text-sm">
              {searchQuery ? 'No employees found' : 'No employees available'}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredEmployees.map((employee) => (
              <div
                key={employee.id}
                onClick={() => onEmployeeSelect(employee.id)}
                className="flex items-center gap-3 p-4 hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={employee.avatar_url} />
                  <AvatarFallback className="text-sm">
                    {employee.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm truncate">
                      {employee.name}
                    </h4>
                    <div className="w-2 h-2 bg-green-500 rounded-full" title="Online" />
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground truncate">
                      {employee.job_title}
                    </p>
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      {employee.department}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};