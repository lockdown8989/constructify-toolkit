
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Clock, Plane, LogOut } from 'lucide-react';
import { format } from 'date-fns';

interface Employee {
  id: string;
  name: string;
  avatar?: string;
  job_title?: string;
  department?: string;
}

interface AttendanceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'holiday' | 'clocked-in' | 'clocked-out';
  employees: Employee[];
  attendanceData?: any;
}

const AttendanceDetailModal: React.FC<AttendanceDetailModalProps> = ({
  isOpen,
  onClose,
  type,
  employees,
  attendanceData
}) => {
  const getTitle = () => {
    switch (type) {
      case 'holiday':
        return `Employees on Holiday (${employees.length})`;
      case 'clocked-in':
        return `Clocked In Employees (${employees.length})`;
      case 'clocked-out':
        return `Clocked Out Employees (${employees.length})`;
      default:
        return 'Employee Details';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'holiday':
        return <Plane className="w-5 h-5 text-blue-500" />;
      case 'clocked-in':
        return <Clock className="w-5 h-5 text-green-500" />;
      case 'clocked-out':
        return <LogOut className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (type) {
      case 'holiday':
        return 'bg-blue-100 text-blue-800';
      case 'clocked-in':
        return 'bg-green-100 text-green-800';
      case 'clocked-out':
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getIcon()}
            {getTitle()}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {employees.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No employees {type === 'holiday' ? 'on holiday' : type.replace('-', ' ')} today
            </div>
          ) : (
            <div className="grid gap-3">
              {employees.map((employee) => (
                <div 
                  key={employee.id} 
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={employee.avatar} />
                      <AvatarFallback className="bg-gray-200">
                        {employee.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="font-medium text-gray-900">{employee.name}</div>
                      <div className="text-sm text-gray-500">
                        {employee.job_title} {employee.department && `• ${employee.department}`}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor()}>
                      {type === 'holiday' ? 'On Holiday' : 
                       type === 'clocked-in' ? 'Present' : 'Absent'}
                    </Badge>
                    
                    {type === 'clocked-in' && attendanceData && (
                      <div className="text-xs text-gray-500">
                        Since {format(new Date(), 'HH:mm')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <div className="text-sm text-gray-500">
            Last updated: {format(new Date(), 'HH:mm:ss')}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AttendanceDetailModal;
