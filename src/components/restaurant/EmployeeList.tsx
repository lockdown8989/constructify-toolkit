
import React, { useState } from 'react';
import { Employee } from '@/types/restaurant-schedule';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EmployeeListProps {
  employees: Employee[];
}

const EmployeeList: React.FC<EmployeeListProps> = ({ employees }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900 mb-3">Team Members</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {filteredEmployees.map((employee) => {
            const initials = employee.name.split(' ').map(n => n[0]).join('');
            
            return (
              <div
                key={employee.id}
                className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-gray-100"
              >
                <Avatar className="h-9 w-9 mr-3 border border-gray-200">
                  <AvatarImage src={employee.avatarUrl} alt={employee.name} />
                  <AvatarFallback 
                    className="text-xs font-medium"
                    style={{ backgroundColor: employee.color + '20', color: employee.color }}
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {employee.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {employee.role}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      £{employee.hourlyRate}/hr
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {filteredEmployees.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <p className="text-sm">No employees found</p>
          {searchQuery && (
            <p className="text-xs mt-1">Try adjusting your search</p>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
