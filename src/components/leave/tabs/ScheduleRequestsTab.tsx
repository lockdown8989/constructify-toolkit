
import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, ChevronRight, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Mock data for the component
const mockRequests = [
  {
    id: '1',
    employeeName: 'John Doe',
    type: 'Shift Swap',
    date: '2023-05-15',
    status: 'Pending',
  },
  {
    id: '2',
    employeeName: 'Jane Smith',
    type: 'Time Off',
    date: '2023-05-18',
    status: 'Approved',
  },
  {
    id: '3',
    employeeName: 'Mike Johnson',
    type: 'Schedule Change',
    date: '2023-05-20',
    status: 'Rejected',
  },
];

const ScheduleRequestsTab = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const { isAdmin, isHR, isManager } = useAuth();
  
  // Convert isManager from function to boolean if needed
  const hasManagerAccess = isAdmin || isHR || isManager;
  
  // Filter requests based on active tab
  const filteredRequests = mockRequests.filter(request => {
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
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="pt-4">
          {filteredRequests.length > 0 ? (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <Card key={request.id} className="overflow-hidden">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-lg">{request.employeeName}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(request.date).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge className={`${getStatusColor(request.status)} border`}>
                        {request.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-4 pt-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{request.type}</span>
                      </div>
                      
                      {hasManagerAccess && request.status === 'Pending' && (
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">Reject</Button>
                          <Button size="sm">Approve</Button>
                        </div>
                      )}
                      
                      {request.status !== 'Pending' && (
                        <Button variant="ghost" size="sm" className="text-gray-500">
                          Details <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-900">No requests found</h3>
              <p className="mt-1 text-sm text-gray-500">
                There are no {activeTab} schedule requests at this time.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScheduleRequestsTab;
