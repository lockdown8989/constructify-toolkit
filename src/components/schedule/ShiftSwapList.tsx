import React, { useState } from 'react';
import { format } from 'date-fns';
import { useEmployees } from '@/hooks/use-employees';
import { useSchedules } from '@/hooks/use-schedules';
import { useShiftSwaps, useUpdateShiftSwap, ShiftSwap } from '@/hooks/use-shift-swaps';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, AlertCircle, Clock, ArrowLeftRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

const ShiftSwapList = () => {
  const { data: swaps = [], isLoading: isLoadingSwaps } = useShiftSwaps();
  const { data: schedules = [] } = useSchedules();
  const { data: employees = [] } = useEmployees();
  const { user, isAdmin, isHR, isManager } = useAuth();
  const { mutate: updateSwap } = useUpdateShiftSwap();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'completed'>('pending');
  
  if (!user) {
    return (
      <div className="text-center p-6">
        Please sign in to view shift swaps
      </div>
    );
  }
  
  const isManager = isAdmin || isHR || isManager;
  
  const filteredSwaps = swaps.filter(swap => {
    switch (activeTab) {
      case 'pending':
        return swap.status === 'Pending';
      case 'approved':
        return swap.status === 'Approved';
      case 'rejected':
        return swap.status === 'Rejected';
      case 'completed':
        return swap.status === 'Completed';
      default:
        return true;
    }
  }).filter(swap => {
    if (isManager) {
      return true;
    } else {
      return swap.requester_id === user.id || swap.recipient_id === user.id;
    }
  });
  
  const getScheduleDetails = (scheduleId: string) => {
    const schedule = schedules.find(s => s.id === scheduleId);
    if (!schedule) return 'Unknown schedule';
    
    const startTime = new Date(schedule.start_time);
    const endTime = new Date(schedule.end_time);
    
    return `${schedule.title} (${format(startTime, 'PPP')}, ${format(startTime, 'h:mm a')} - ${format(endTime, 'h:mm a')})`;
  };
  
  const getEmployeeName = (userId: string) => {
    const employee = employees.find(e => e.id === userId);
    return employee ? employee.name : 'Unknown Employee';
  };
  
  const handleApprove = (swap: ShiftSwap) => {
    updateSwap({
      id: swap.id,
      status: 'Approved',
      updated_at: new Date().toISOString()
    });
  };
  
  const handleReject = (swap: ShiftSwap) => {
    updateSwap({
      id: swap.id,
      status: 'Rejected',
      updated_at: new Date().toISOString()
    });
  };
  
  const handleComplete = (swap: ShiftSwap) => {
    updateSwap({
      id: swap.id,
      status: 'Completed',
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
      case 'Completed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const renderActions = (swap: ShiftSwap) => {
    if (swap.status === 'Pending' && (isManager || user.id === swap.recipient_id)) {
      return (
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" className="text-green-600" onClick={() => handleApprove(swap)}>
            <Check className="h-4 w-4 mr-1" />
            Approve
          </Button>
          <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleReject(swap)}>
            <X className="h-4 w-4 mr-1" />
            Reject
          </Button>
        </div>
      );
    }
    
    if (swap.status === 'Approved' && isManager) {
      return (
        <Button size="sm" variant="outline" onClick={() => handleComplete(swap)}>
          <Check className="h-4 w-4 mr-1" />
          Mark Completed
        </Button>
      );
    }
    
    return null;
  };
  
  if (isLoadingSwaps) {
    return <div className="text-center p-6">Loading shift swaps...</div>;
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5" />
            Shift Swap Requests
          </div>
        </CardTitle>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <div className="px-6">
          <TabsList className="w-full">
            <TabsTrigger value="pending" className="flex-1">Pending</TabsTrigger>
            <TabsTrigger value="approved" className="flex-1">Approved</TabsTrigger>
            <TabsTrigger value="rejected" className="flex-1">Rejected</TabsTrigger>
            <TabsTrigger value="completed" className="flex-1">Completed</TabsTrigger>
          </TabsList>
        </div>
        
        <CardContent className="pt-6">
          {filteredSwaps.length === 0 ? (
            <div className="text-center p-6 text-gray-500">
              No {activeTab} shift swap requests found
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSwaps.map(swap => (
                <div key={swap.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium">
                        {getEmployeeName(swap.requester_id)} → {getEmployeeName(swap.recipient_id)}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        <Clock className="h-3.5 w-3.5 inline mr-1" />
                        Requested on {format(new Date(swap.created_at), 'PPP')}
                      </div>
                    </div>
                    <div>{renderStatusBadge(swap.status)}</div>
                  </div>
                  
                  <div className="space-y-2 mt-3">
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="text-sm font-medium">Requested Shift:</div>
                      <div className="text-sm">{getScheduleDetails(swap.requester_schedule_id)}</div>
                    </div>
                    
                    {swap.recipient_schedule_id && (
                      <div className="bg-gray-50 p-3 rounded-md">
                        <div className="text-sm font-medium">Swap With:</div>
                        <div className="text-sm">{getScheduleDetails(swap.recipient_schedule_id)}</div>
                      </div>
                    )}
                    
                    {swap.notes && (
                      <div className="text-sm mt-2">
                        <span className="font-medium">Notes: </span> 
                        {swap.notes}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 flex justify-end">
                    {renderActions(swap)}
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

export default ShiftSwapList;
