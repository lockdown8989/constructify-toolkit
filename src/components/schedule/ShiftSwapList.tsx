
import React, { useState } from 'react';
import { format } from 'date-fns';
import { useEmployees } from '@/hooks/use-employees';
import { useSchedules } from '@/hooks/use-schedules';
import { useShiftSwaps, useUpdateShiftSwap, useDeleteShiftSwap, ShiftSwap } from '@/hooks/use-shift-swaps';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeftRight } from 'lucide-react';
import ShiftSwapStatusBadge from './ShiftSwapStatusBadge';
import ShiftSwapTabContent from './ShiftSwapTabContent';
import { useToast } from '@/hooks/use-toast';
import ShiftSwapItem from './ShiftSwapItem';

const ShiftSwapList = () => {
  const { data: swaps = [], isLoading: isLoadingSwaps } = useShiftSwaps();
  const { data: schedules = [] } = useSchedules();
  const { data: employees = [] } = useEmployees();
  const { user, isAdmin, isHR, isManager } = useAuth();
  const { mutate: updateSwap } = useUpdateShiftSwap();
  const { mutate: deleteSwap } = useDeleteShiftSwap();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'completed'>('pending');
  
  if (!user) {
    return (
      <div className="text-center p-6">
        Please sign in to view shift swaps
      </div>
    );
  }
  
  const canApproveSwaps = isAdmin || isHR || isManager;
  
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
    if (canApproveSwaps) {
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
  
  const handleApprove = (swapId: string) => {
    updateSwap({
      id: swapId,
      status: 'Approved',
      updated_at: new Date().toISOString()
    });
  };
  
  const handleReject = (swapId: string) => {
    updateSwap({
      id: swapId,
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
  
  const handleDelete = (swapId: string) => {
    if (confirm('Are you sure you want to delete this shift swap request?')) {
      deleteSwap(swapId, {
        onSuccess: () => {
          toast({
            title: "Shift swap deleted",
            description: "The shift swap request has been deleted successfully.",
          });
        }
      });
    }
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
            <div className="text-center py-6 text-gray-500">
              No shift swaps found in this category.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSwaps.map(swap => (
                <ShiftSwapItem
                  key={swap.id}
                  swap={swap}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Tabs>
    </Card>
  );
};

export default ShiftSwapList;
