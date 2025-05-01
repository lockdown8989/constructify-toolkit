
import React, { useState } from 'react';
import { useEmployees } from '@/hooks/use-employees';
import { useSchedules } from '@/hooks/use-schedules';
import { useShiftSwaps, useUpdateShiftSwap, useDeleteShiftSwap, ShiftSwap } from '@/hooks/use-shift-swaps';
import { useAuth } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeftRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ShiftSwapItem from './ShiftSwapItem';
import { Skeleton } from '@/components/ui/skeleton';

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
      <div className="text-center p-6 text-gray-500">
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
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="pending" className="text-xs h-8">Pending</TabsTrigger>
          <TabsTrigger value="approved" className="text-xs h-8">Approved</TabsTrigger>
          <TabsTrigger value="rejected" className="text-xs h-8">Rejected</TabsTrigger>
          <TabsTrigger value="completed" className="text-xs h-8">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="pt-2">
          {filteredSwaps.length === 0 ? (
            <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
              <ArrowLeftRight className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No shift swaps found in this category</p>
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ShiftSwapList;
