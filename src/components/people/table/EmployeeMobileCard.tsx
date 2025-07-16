
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Building, MapPin, Briefcase, PoundSterling } from 'lucide-react';
import { Employee } from '@/types/employee';
import { EmployeeStatusDropdown } from '../modals/employee-details/EmployeeStatusDropdown';

interface EmployeeMobileCardProps {
  employee: Employee;
  onEmployeeClick: (employee: Employee) => void;
  onStatusChange: (employee: Employee, newStatus: string) => void;
  isUpdating: boolean;
}

export const EmployeeMobileCard: React.FC<EmployeeMobileCardProps> = ({
  employee,
  onEmployeeClick,
  onStatusChange,
  isUpdating
}) => {
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on the status dropdown
    if ((e.target as HTMLElement).closest('.status-dropdown')) {
      return;
    }
    onEmployeeClick(employee);
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'invited':
        return 'outline';
      case 'absent':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Card 
      className="mb-3 cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with name and status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{employee.name}</span>
            </div>
            <div className="status-dropdown" onClick={(e) => e.stopPropagation()}>
              <EmployeeStatusDropdown
                currentStatus={employee.status}
                onStatusChange={(newStatus) => onStatusChange(employee, newStatus)}
                disabled={isUpdating}
              />
            </div>
          </div>

          {/* Job details */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Briefcase className="h-3 w-3" />
              <span>{employee.job_title}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Building className="h-3 w-3" />
              <span>{employee.department} - {employee.site}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <PoundSterling className="h-3 w-3" />
                <span>£{employee.salary?.toLocaleString() || '0'}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {employee.employment_type}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
