
import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { useEmployees } from '@/hooks/use-employees';
import { useAvailabilityRequests, useUpdateAvailabilityRequest, AvailabilityRequest } from '@/hooks/use-availability';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Clock, Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';

const AvailabilityRequestList = () => {
  const { data: requests = [], isLoading } = useAvailabilityRequests();
  const { data: employees = [] } = useEmployees();
  const { user, isAdmin, isHR, isManager } = useAuth();
  const { mutate: updateRequest } = useUpdateAvailabilityRequest();
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const isMobile = useIsMobile();
  
  if (!user) {
    return (
      <div className="text-center p-6">
        Please sign in to view availability requests
      </div>
    );
  }
  
  const canApproveRequests = isAdmin || isHR || isManager;
  
  const filteredRequests = requests.filter(request => {
    switch (activeTab) {
      case 'pending':
        return request.status === 'Pending';
      case 'approved':
        return request.status === 'Approved';
      case 'rejected':
        return request.status === 'Rejected';
      default:
        return true;
    }
  }).filter(request => {
    if (canApproveRequests) {
      return true;
    } else {
      return request.employee_id === user.id;
    }
  });
  
  const getEmployeeName = (userId: string) => {
    const employee = employees.find(e => e.id === userId);
    return employee ? employee.name : 'Unknown Employee';
  };
  
  const handleApprove = (request: AvailabilityRequest) => {
    updateRequest({
      id: request.id,
      status: 'Approved',
      updated_at: new Date().toISOString()
    });
  };
  
  const handleReject = (request: AvailabilityRequest) => {
    updateRequest({
      id: request.id,
      status: 'Rejected',
      updated_at: new Date().toISOString()
    });
  };
  
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'Approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case 'Rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const renderActions = (request: AvailabilityRequest) => {
    if (request.status === 'Pending' && canApproveRequests) {
      return (
        <div className="flex space-x-2">
          <Button size={isMobile ? "icon" : "sm"} variant="outline" className="text-green-600" onClick={() => handleApprove(request)}>
            <Check className="h-4 w-4" />
            {!isMobile && <span className="ml-1">Approve</span>}
          </Button>
          <Button size={isMobile ? "icon" : "sm"} variant="outline" className="text-red-600" onClick={() => handleReject(request)}>
            <X className="h-4 w-4" />
            {!isMobile && <span className="ml-1">Reject</span>}
          </Button>
        </div>
      );
    }
    
    return null;
  };
  
  if (isLoading) {
    return <div className="text-center p-6">Loading availability requests...</div>;
  }
  
  return (
    <Card className="w-full">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center justify-between text-lg sm:text-xl">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Availability Requests
          </div>
        </CardTitle>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <div className="px-4 sm:px-6">
          <TabsList className="w-full">
            <TabsTrigger value="pending" className="flex-1 text-xs sm:text-sm">Pending</TabsTrigger>
            <TabsTrigger value="approved" className="flex-1 text-xs sm:text-sm">Approved</TabsTrigger>
            <TabsTrigger value="rejected" className="flex-1 text-xs sm:text-sm">Rejected</TabsTrigger>
          </TabsList>
        </div>
        
        <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
          {filteredRequests.length === 0 ? (
            <div className="text-center p-4 sm:p-6 text-gray-500">
              No {activeTab} availability requests found
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredRequests.map(request => (
                <div key={request.id} className="border rounded-lg p-3 sm:p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium text-sm sm:text-base">
                        {getEmployeeName(request.employee_id)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500 mt-1">
                        <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 inline mr-1" />
                        Requested on {format(new Date(request.created_at), 'PPP')}
                      </div>
                    </div>
                    <div>{renderStatusBadge(request.status)}</div>
                  </div>
                  
                  <div className="space-y-2 mt-3">
                    <div className="bg-gray-50 p-2 sm:p-3 rounded-md">
                      <div className="text-xs sm:text-sm font-medium">Date:</div>
                      <div className="text-xs sm:text-sm">{format(parseISO(request.date), 'PPPP')}</div>
                    </div>
                    
                    <div className="bg-gray-50 p-2 sm:p-3 rounded-md">
                      <div className="text-xs sm:text-sm font-medium">Time:</div>
                      <div className="text-xs sm:text-sm">
                        {request.start_time} - {request.end_time}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-2 sm:p-3 rounded-md">
                      <div className="text-xs sm:text-sm font-medium">Availability:</div>
                      <div className="text-xs sm:text-sm">
                        {request.is_available ? (
                          <span className="text-green-600">Available</span>
                        ) : (
                          <span className="text-red-600">Not Available</span>
                        )}
                      </div>
                    </div>
                    
                    {request.notes && (
                      <div className="text-xs sm:text-sm mt-2">
                        <span className="font-medium">Notes: </span> 
                        {request.notes}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 flex justify-end">
                    {renderActions(request)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Tabs>
    </Card>
  );
};

export default AvailabilityRequestList;
