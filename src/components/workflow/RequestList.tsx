
import React from 'react';
import { useWorkflowRequests } from '@/hooks/workflow/useWorkflowRequests';
import RequestItem from './RequestItem';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';

const RequestList: React.FC = () => {
  const { isManager, isAdmin, isHR } = useAuth();
  const { 
    userRequests,
    pendingRequests,
    isLoadingUserRequests,
    isLoadingPendingRequests
  } = useWorkflowRequests();
  const hasManagerAccess = isManager || isAdmin || isHR;
  const [searchTerm, setSearchTerm] = React.useState('');
  const [requestTypeFilter, setRequestTypeFilter] = React.useState('all');
  const [statusFilter, setStatusFilter] = React.useState('all');
  
  // Get unique request types
  const getUniqueRequestTypes = () => {
    const allRequests = [...userRequests, ...pendingRequests];
    const types = new Set(allRequests.map(request => request.request_type));
    return Array.from(types);
  };
  
  // Filter requests based on search and filters
  const getFilteredRequests = (requests: any[]) => {
    return requests.filter(request => {
      // Filter by search term
      const matchesSearch = searchTerm === '' || 
        request.request_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        JSON.stringify(request.details).toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by request type
      const matchesType = requestTypeFilter === 'all' || 
        request.request_type === requestTypeFilter;
      
      // Filter by status
      const matchesStatus = statusFilter === 'all' || 
        request.status === statusFilter;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  };
  
  // Filter user requests and pending requests
  const filteredUserRequests = getFilteredRequests(userRequests);
  const filteredPendingRequests = getFilteredRequests(pendingRequests);
  
  if (isLoadingUserRequests || (hasManagerAccess && isLoadingPendingRequests)) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  const requestTypes = getUniqueRequestTypes();
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
        <Input
          placeholder="Search requests..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select 
          value={requestTypeFilter} 
          onValueChange={setRequestTypeFilter}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Request Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {requestTypes.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select 
          value={statusFilter} 
          onValueChange={setStatusFilter}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {hasManagerAccess ? (
        <Tabs defaultValue="pending">
          <TabsList className="mb-4">
            <TabsTrigger value="pending">
              Pending Review ({filteredPendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="my-requests">
              My Requests ({filteredUserRequests.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending">
            {filteredPendingRequests.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                <p>No pending requests to review</p>
              </div>
            ) : (
              <div>
                {filteredPendingRequests.map(request => (
                  <RequestItem 
                    key={request.id}
                    request={request}
                    showActions
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="my-requests">
            {filteredUserRequests.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                <p>You haven't submitted any requests yet</p>
              </div>
            ) : (
              <div>
                {filteredUserRequests.map(request => (
                  <RequestItem 
                    key={request.id}
                    request={request}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <div>
          {filteredUserRequests.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              <p>You haven't submitted any requests yet</p>
            </div>
          ) : (
            <div>
              {filteredUserRequests.map(request => (
                <RequestItem 
                  key={request.id}
                  request={request}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RequestList;
