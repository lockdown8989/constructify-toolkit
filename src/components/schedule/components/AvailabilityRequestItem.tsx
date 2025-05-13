
import React from 'react';
import { format } from 'date-fns';
import { Clock, User, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AvailabilityRequest } from '@/types/availability';
import { useAuth } from '@/hooks/use-auth';
import StatusBadge from './StatusBadge';
import HistoryHoverCard from './HistoryHoverCard';

interface AvailabilityRequestItemProps {
  request: AvailabilityRequest;
  onReview: (requestId: string) => void;
}

const AvailabilityRequestItem = ({ request, onReview }: AvailabilityRequestItemProps) => {
  const { isManager } = useAuth();
  const employee = request.employees;

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-gray-300 transition-all">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="space-y-2 flex-grow">
          {isManager && employee && (
            <div className="flex flex-wrap gap-2 mb-1">
              <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-2 py-1 rounded-md">
                <User className="h-3.5 w-3.5" />
                <span className="text-sm font-medium">{employee.name}</span>
              </div>
              {employee.department && (
                <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-2 py-1 rounded-md">
                  <Building className="h-3.5 w-3.5" />
                  <span className="text-sm">{employee.department}</span>
                </div>
              )}
            </div>
          )}
          <div>
            <div className="font-medium text-gray-900">
              {format(new Date(request.date), 'EEEE, MMMM d, yyyy')}
            </div>
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <Clock className="h-3.5 w-3.5 mr-1.5" />
              {request.start_time} - {request.end_time}
            </div>
          </div>
          {request.notes && (
            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
              {request.notes}
            </div>
          )}
          {request.manager_notes && (
            <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded-md">
              <span className="font-medium">Manager Note: </span>
              {request.manager_notes}
            </div>
          )}
        </div>
        <div className="flex flex-col items-start sm:items-end space-y-2">
          <StatusBadge status={request.status} />
          <span className="text-sm text-gray-600">
            {request.is_available ? 'Available' : 'Unavailable'}
          </span>
          <HistoryHoverCard request={request} />
          {isManager && request.status === 'Pending' && (
            <Button 
              variant="outline" 
              size="sm"
              className="mt-2"
              onClick={() => onReview(request.id)}
            >
              Review Request
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvailabilityRequestItem;
