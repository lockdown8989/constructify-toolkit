
import React from 'react';
import { Employee } from '@/types/restaurant-schedule';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Clock, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface EmployeeListProps {
  employees: Employee[];
}

const EmployeeList = ({ employees }: EmployeeListProps) => {
  const handleDragStart = (e: React.DragEvent, employeeId: string) => {
    e.dataTransfer.setData('employeeId', employeeId);
    e.dataTransfer.effectAllowed = 'move';
    
    // Create and append ghost image element securely
    const ghostEl = document.createElement('div');
    ghostEl.className = 'fixed top-0 left-0 -translate-x-full bg-white rounded-lg shadow-lg p-3 pointer-events-none';
    
    // Secure DOM creation without innerHTML
    const flexDiv = document.createElement('div');
    flexDiv.className = 'flex items-center';
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 mr-2';
    
    const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgEl.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svgEl.setAttribute('class', 'h-4 w-4');
    svgEl.setAttribute('viewBox', '0 0 24 24');
    svgEl.setAttribute('fill', 'none');
    svgEl.setAttribute('stroke', 'currentColor');
    svgEl.setAttribute('stroke-width', '2');
    
    const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path1.setAttribute('d', 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2');
    
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '12');
    circle.setAttribute('cy', '7');
    circle.setAttribute('r', '4');
    
    svgEl.appendChild(path1);
    svgEl.appendChild(circle);
    avatarDiv.appendChild(svgEl);
    
    const textDiv = document.createElement('div');
    textDiv.textContent = 'Assigning...';
    
    flexDiv.appendChild(avatarDiv);
    flexDiv.appendChild(textDiv);
    ghostEl.appendChild(flexDiv);
    document.body.appendChild(ghostEl);
    
    if (e.dataTransfer.setDragImage) {
      e.dataTransfer.setDragImage(ghostEl, 10, 10);
    }
    
    // Clean up after drag starts
    setTimeout(() => {
      document.body.removeChild(ghostEl);
    }, 0);
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-4 border-b border-gray-200 bg-gray-50/50 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-gray-700" />
            <span className="font-semibold text-gray-800">Staff Members</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {employees.length}
          </Badge>
        </div>
      </div>
      
      <div className="p-3 space-y-2 max-h-[600px] overflow-y-auto">
        {employees.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No employees found</p>
          </div>
        ) : (
          employees.map(employee => {
            const initials = employee.name.split(' ').map(n => n[0]).join('');
            
            return (
              <div 
                key={employee.id}
                draggable
                onDragStart={(e) => handleDragStart(e, employee.id)}
                className={cn(
                  "flex items-center p-3 rounded-lg hover:bg-gray-50 hover:shadow-sm cursor-move transition-all duration-200 border border-transparent hover:border-gray-200",
                  "active-touch-state group"
                )}
              >
                <Avatar className="h-10 w-10 mr-3 border-2 border-gray-100 group-hover:border-gray-200">
                  <AvatarImage src={employee.avatarUrl || '/placeholder.svg'} alt={employee.name} />
                  <AvatarFallback 
                    className="text-white font-semibold text-sm" 
                    style={{ backgroundColor: employee.color }}
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 overflow-hidden">
                  <div className="font-medium text-sm text-gray-900 truncate">
                    {employee.name}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {employee.role}
                    </Badge>
                    {employee.hourlyRate && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        £{employee.hourlyRate}/hr
                      </span>
                    )}
                  </div>
                  {(employee as any).location && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                      <MapPin className="h-3 w-3" />
                      {(employee as any).location}
                    </div>
                  )}
                </div>
                
                <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-2 h-8 bg-gray-300 rounded-full flex flex-col justify-center items-center gap-1">
                    <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                    <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                    <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default EmployeeList;
