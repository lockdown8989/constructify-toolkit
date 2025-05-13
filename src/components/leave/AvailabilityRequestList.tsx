
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, X, Clock } from 'lucide-react';
import { AvailabilityRequest } from '@/types/supabase/leave';

interface AvailabilityRequestListProps {
  requests: AvailabilityRequest[] | undefined;
  onApprove: (id: string, notes?: string) => void;
  onReject: (id: string, notes?: string) => void;
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
  const pendingRequests = requests.filter(req => req.status === 'Pending');
  const approvedRequests = requests.filter(req => req.status === 'Approved');
  const rejectedRequests = requests.filter(req => req.status === 'Rejected');
  
  if (requests.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <p>No availability requests found.</p>
        <p className="text-sm mt-2">
          Availability requests will appear here when employees submit their preferred working hours.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      case 'Approved':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Approved</span>;
      case 'Rejected':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Rejected</span>;
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-4">
      {pendingRequests.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Pending Requests</h3>
          <div className="space-y-3">
            {pendingRequests.map(request => (
              <div key={request.id} className="p-4 border rounded-lg bg-white shadow-sm">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">
                      {request.employee_id}
                    </p>
                    <div className="flex items-center mt-1">
                      <Clock className="h-3 w-3 mr-1 text-gray-500" />
                      <p className="text-sm text-gray-500">
                        {formatDate(request.date)}: {request.start_time} - {request.end_time}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
                
                {request.notes && (
                  <div className="mt-2 text-sm bg-gray-50 p-2 rounded">
                    <span className="font-medium">Notes:</span> {request.notes}
                  </div>
                )}
                
                {canManage && (
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
        </div>
      )}
      
      {approvedRequests.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Approved Requests</h3>
          <div className="space-y-3">
            {approvedRequests.map(request => (
              <div key={request.id} className="p-4 border rounded-lg bg-white shadow-sm">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{request.employee_id}</p>
                    <div className="flex items-center mt-1">
                      <Clock className="h-3 w-3 mr-1 text-gray-500" />
                      <p className="text-sm text-gray-500">
                        {formatDate(request.date)}: {request.start_time} - {request.end_time}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
                
                {request.manager_notes && (
                  <div className="mt-2 text-sm bg-gray-50 p-2 rounded">
                    <span className="font-medium">Manager Notes:</span> {request.manager_notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {rejectedRequests.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Rejected Requests</h3>
          <div className="space-y-3">
            {rejectedRequests.map(request => (
              <div key={request.id} className="p-4 border rounded-lg bg-white shadow-sm">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{request.employee_id}</p>
                    <div className="flex items-center mt-1">
                      <Clock className="h-3 w-3 mr-1 text-gray-500" />
                      <p className="text-sm text-gray-500">
                        {formatDate(request.date)}: {request.start_time} - {request.end_time}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
                
                {request.manager_notes && (
                  <div className="mt-2 text-sm bg-gray-50 p-2 rounded">
                    <span className="font-medium">Reason for rejection:</span> {request.manager_notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
