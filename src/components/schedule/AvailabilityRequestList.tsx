
import React from 'react';
import { format } from 'date-fns';
import { useAvailabilityRequests, useUpdateAvailabilityRequest } from '@/hooks/availability';
import { useAuth } from '@/hooks/use-auth';
import { Clock, Loader2, User, Building, CheckCircle2, XCircle, AlertCircle, History, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const AvailabilityRequestList = () => {
  const { data: requests = [], isLoading: isLoadingRequests, isError, error } = useAvailabilityRequests();
  const { user, isManager } = useAuth();
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
          {isManager 
            ? 'No employees have set availability preferences yet.'
            : 'Set your preferred working hours to help your manager schedule shifts more effectively.'}
        </p>
      </div>
    );
  }
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
            Approved
          </Badge>
        );
      case 'Rejected':
        return (
          <Badge className="bg-rose-50 text-rose-700 border-rose-200 flex items-center">
            <XCircle className="h-3.5 w-3.5 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 flex items-center">
            <AlertCircle className="h-3.5 w-3.5 mr-1" />
            Pending
          </Badge>
        );
    }
  };
  
  const getAuditTrail = (request: any) => {
    if (!request.audit_log?.length) return null;
    
    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          <button className="text-xs text-gray-500 flex items-center hover:text-gray-700 transition-colors">
            <History className="h-3.5 w-3.5 mr-1" />
            View History
          </button>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Request History</h4>
            {request.audit_log.map((log: any, index: number) => (
              <div key={index} className="text-xs border-l-2 border-gray-200 pl-2">
                <p className="text-gray-600">
                  Status changed from {log.old_status} to {log.new_status}
                </p>
                <p className="text-gray-400">
                  {format(new Date(log.timestamp), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            ))}
          </div>
        </HoverCardContent>
      </HoverCard>
    );
  };
  
  return (
    <div className="space-y-3 mt-2">
      {requests.map((request) => {
        const employee = request.employees;
        
        return (
          <div 
            key={request.id} 
            className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-gray-300 transition-all"
          >
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
                {getStatusBadge(request.status)}
                <span className="text-sm text-gray-600">
                  {request.is_available ? 'Available' : 'Unavailable'}
                </span>
                {getAuditTrail(request)}
                {isManager && request.status === 'Pending' && (
                  <Dialog open={selectedRequest === request.id} onOpenChange={(open) => {
                    if (!open) {
                      setSelectedRequest(null);
                      setManagerNotes("");
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="mt-2"
                        onClick={() => setSelectedRequest(request.id)}
                      >
                        Review Request
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Review Availability Request</DialogTitle>
                        <DialogDescription>
                          Review and respond to the availability request from {employee?.name}.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Manager Notes</label>
                          <Textarea
                            value={managerNotes}
                            onChange={(e) => setManagerNotes(e.target.value)}
                            placeholder="Add any notes or feedback about this request..."
                            className="mt-1"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="destructive"
                            onClick={() => handleReject(request.id)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            onClick={() => handleApprove(request.id)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AvailabilityRequestList;
