
import React from 'react';
import { AvailabilityRequest } from '@/types/availability';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface AvailabilityRequestListProps {
  requests: AvailabilityRequest[] | undefined;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  canManage: boolean;
  formatDate: (date: string) => string;
}

export const AvailabilityRequestList: React.FC<AvailabilityRequestListProps> = ({
  requests = [],
  onApprove,
  onReject,
  canManage,
  formatDate
}) => {
  if (requests.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="flex flex-col items-center justify-center">
          <Calendar className="h-8 w-8 mb-2 text-gray-400" />
          <p>No availability requests found</p>
          <p className="text-sm mt-1">
            Employees can submit their preferred working hours here
          </p>
        </div>
      </div>
    );
  }

  const formatTime = (timeString: string) => {
    try {
      return format(new Date(`2000-01-01T${timeString}`), 'h:mm a');
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeString;
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-300 flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'Approved':
        return (
          <Badge className="bg-green-100 text-green-800 border border-green-300 flex items-center">
            <Check className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case 'Rejected':
        return (
          <Badge className="bg-red-100 text-red-800 border border-red-300 flex items-center">
            <X className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div key={request.id} className="p-4 border rounded-lg shadow-sm bg-white">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="font-medium">
                {request.employees?.name || `Employee #${request.employee_id}`}
              </p>
              <p className="text-sm text-gray-500">
                {formatDate(request.date)} • {formatTime(request.start_time)} - {formatTime(request.end_time)}
              </p>
              <p className="text-sm mt-1">
                <span className="font-medium">Status:</span> {request.is_available ? 'Available' : 'Unavailable'}
              </p>
            </div>
            <div>
              {renderStatusBadge(request.status)}
            </div>
          </div>
          
          {request.notes && (
            <div className="text-sm bg-gray-50 p-2 rounded-md mb-3">
              <span className="font-medium">Employee Notes:</span> {request.notes}
            </div>
          )}
          
          {request.manager_notes && (
            <div className="text-sm bg-blue-50 p-2 rounded-md mb-3">
              <span className="font-medium">Manager Notes:</span> {request.manager_notes}
            </div>
          )}
          
          {canManage && request.status === 'Pending' && (
            <div className="flex gap-2 mt-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-green-500 text-green-600 hover:bg-green-50"
                onClick={() => onApprove(request.id)}
              >
                <Check className="h-4 w-4 mr-1" /> Approve
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-red-500 text-red-600 hover:bg-red-50"
                onClick={() => onReject(request.id)}
              >
                <X className="h-4 w-4 mr-1" /> Reject
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
