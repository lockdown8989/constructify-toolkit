
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useAvailabilityRequests, useUpdateAvailabilityRequest } from '@/hooks/availability';
import { useAuth } from '@/hooks/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { AvailabilityRequest } from '@/types/availability';

interface AvailabilityRequestListProps {
  requests?: AvailabilityRequest[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  canManage?: boolean;
  formatDate?: (date: string) => string;
}

export const AvailabilityRequestList: React.FC<AvailabilityRequestListProps> = ({
  requests: propRequests,
  onApprove,
  onReject,
  canManage,
  formatDate
}) => {
  const { data: fetchedRequests, isLoading, isError } = useAvailabilityRequests();
  const { user, isManager, isAdmin, isHR } = useAuth();
  const { mutate: updateRequest } = useUpdateAvailabilityRequest();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  
  // Use prop requests if provided, otherwise use fetched requests
  const requests = propRequests || fetchedRequests || [];
  const hasManagerAccess = canManage !== undefined ? canManage : (isManager || isAdmin || isHR);
  
  const handleApprove = (requestId: string) => {
    if (onApprove) {
      onApprove(requestId);
    } else {
      updateRequest({
        id: requestId,
        status: 'Approved',
        manager_notes: notes,
        reviewer_id: user?.id
      });
    }
  };
  
  const handleReject = (requestId: string) => {
    if (onReject) {
      onReject(requestId);
    } else {
      updateRequest({
        id: requestId,
        status: 'Rejected',
        manager_notes: notes,
        reviewer_id: user?.id
      });
    }
  };
  
  const formatDateString = (date: string) => {
    if (formatDate) {
      return formatDate(date);
    }
    
    try {
      return format(new Date(date), 'MMM d, yyyy');
    } catch (error) {
      console.error("Date formatting error:", error);
      return date;
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-3 mt-2">
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="text-center py-6 text-red-500">
        <p>Error loading availability data.</p>
        <p className="text-sm mt-2">Please try again later.</p>
      </div>
    );
  }
  
  if (requests.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <p>No availability requests found.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <Card key={request.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:justify-between">
              <div className="mb-2 md:mb-0">
                <h3 className="font-medium">
                  {request.employees?.name || 'Employee'} - {formatDateString(request.date)}
                </h3>
                <p className="text-sm text-gray-500">
                  {request.is_available ? 'Available' : 'Not available'} from {request.start_time} to {request.end_time}
                </p>
                {request.notes && (
                  <p className="text-sm mt-1 text-gray-600">
                    <span className="font-medium">Notes:</span> {request.notes}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className={`px-2 py-1 text-xs rounded-full ${
                  request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                  request.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {request.status}
                </div>
                {hasManagerAccess && request.status === 'Pending' && (
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-green-600 hover:text-green-700 hover:bg-green-50" 
                      onClick={() => handleApprove(request.id)}
                    >
                      Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50" 
                      onClick={() => handleReject(request.id)}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AvailabilityRequestList;
