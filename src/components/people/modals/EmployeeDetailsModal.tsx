
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Briefcase, 
  Users, 
  Edit,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { getInitials } from '@/lib/utils';
import { Employee } from '../types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EmployeeDetailsModalProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (id: string, status: string) => void;
}

const EmployeeDetailsModal: React.FC<EmployeeDetailsModalProps> = ({
  employee,
  isOpen,
  onClose,
  onStatusChange
}) => {
  if (!employee) return null;

  const statusColors = {
    green: 'bg-green-100 text-green-800 hover:bg-green-100',
    gray: 'bg-gray-100 text-gray-800 hover:bg-gray-100'
  };

  const handleStatusChange = (status: string) => {
    if (onStatusChange) {
      onStatusChange(employee.id, status);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        {/* Header with employee avatar and basic info */}
        <div className="bg-gray-50 p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 border-2 border-white">
              <AvatarImage src={employee.avatar} alt={employee.name} />
              <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold mb-1">{employee.name}</DialogTitle>
              <p className="text-gray-500 text-sm mb-2">{employee.jobTitle}</p>
              <Badge variant="outline" className={statusColors[employee.statusColor]}>
                {employee.status}
              </Badge>
            </div>
            <div className="flex gap-2">
              {onStatusChange && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="rounded-full h-9 w-9 p-0">
                      <Clock className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleStatusChange('Active')}>
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      <span>Set as Active</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange('Inactive')}>
                      <XCircle className="mr-2 h-4 w-4 text-gray-500" />
                      <span>Set as Inactive</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange('Invited')}>
                      <Mail className="mr-2 h-4 w-4 text-blue-500" />
                      <span>Set as Invited</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange('Absent')}>
                      <Users className="mr-2 h-4 w-4 text-orange-500" />
                      <span>Set as Absent</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <Button variant="outline" size="icon" className="rounded-full" title="Edit Employee">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Employee details */}
        <div className="p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-4">EMPLOYEE INFORMATION</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Briefcase className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-medium">{employee.department}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Site</p>
                <p className="font-medium">{employee.siteIcon} {employee.site}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Salary</p>
                <p className="font-medium">{employee.salary}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Start Date</p>
                <p className="font-medium">{employee.startDate}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Lifecycle</p>
                <p className="font-medium">{employee.lifecycle}</p>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <h3 className="text-sm font-medium text-gray-500 mb-4">CONTACT INFORMATION</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{employee.name.toLowerCase().replace(/\s/g, '.')}@company.com</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">+1 (555) {Math.floor(100 + Math.random() * 900)}-{Math.floor(1000 + Math.random() * 9000)}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeDetailsModal;
