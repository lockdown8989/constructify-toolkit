
import React, { useState } from 'react';
import { useAvailabilityRequests, useUpdateAvailabilityRequest } from '@/hooks/availability';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import AvailabilityRequestItem from './components/AvailabilityRequestItem';
import ApprovalDialog from './components/ApprovalDialog';

const AvailabilityRequestList = () => {
  const { data: requests = [], isLoading: isLoadingRequests, isError, error } = useAvailabilityRequests();
  const { user } = useAuth();
  const { mutate: updateRequest } = useUpdateAvailabilityRequest();
  const [managerNotes, setManagerNotes] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  
  const handleApprove = (requestId: string) => {
    updateRequest({
      id: requestId,
      status: 'Approved',
      manager_notes: managerNotes,
      reviewer_id: user?.id
    });
    setSelectedRequest(null);
    setManagerNotes("");
  };
  
  const handleReject = (requestId: string) => {
    updateRequest({
      id: requestId,
      status: 'Rejected',
      manager_notes: managerNotes,
      reviewer_id: user?.id
    });
    setSelectedRequest(null);
    setManagerNotes("");
  };
  
  if (isLoadingRequests) {
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
        <p className="text-sm mt-2">
          {error instanceof Error ? error.message : 'Please try again later.'}
        </p>
      </div>
    );
  }
  
  if (requests.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <p>No availability preferences set.</p>
        <p className="text-sm mt-2">
          Set your preferred working hours to help your manager schedule shifts more effectively.
        </p>
      </div>
    );
  }

  const selectedRequestData = requests.find(r => r.id === selectedRequest);
  
  return (
    <div className="space-y-3 mt-2">
      {requests.map((request) => (
        <AvailabilityRequestItem
          key={request.id}
          request={request}
          onReview={(id) => setSelectedRequest(id)}
        />
      ))}
      
      <ApprovalDialog
        isOpen={!!selectedRequest}
        onClose={() => {
          setSelectedRequest(null);
          setManagerNotes("");
        }}
        onApprove={() => selectedRequest && handleApprove(selectedRequest)}
        onReject={() => selectedRequest && handleReject(selectedRequest)}
        managerNotes={managerNotes}
        onNotesChange={setManagerNotes}
        employeeName={selectedRequestData?.employees?.name}
      />
    </div>
  );
};

export default AvailabilityRequestList;
