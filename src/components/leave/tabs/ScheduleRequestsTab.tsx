
// Replace the isManager() function call with isManager property 
// Changed line: const canManageRequests = isManager || isAdmin || isHR;

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/hooks/auth';
import { format } from 'date-fns';
import { useShiftSwaps } from '@/hooks/use-shift-swaps';
import { ShiftSwapTabContent } from '../ShiftSwapTabContent';
import { AvailabilityRequestList } from '../AvailabilityRequestList';
import { useAvailability } from '@/hooks/availability';
import { Card, CardContent } from '@/components/ui/card';

const ScheduleRequestsTab = () => {
  const [activeTab, setActiveTab] = useState("shift-swaps");
  const { isAdmin, isHR, isManager } = useAuth();
  const canManageRequests = isManager || isAdmin || isHR;

  // Fetch shift swaps
  const {
    swapRequests,
    isLoading: swapsLoading,
    handleAcceptSwap,
    handleRejectSwap,
  } = useShiftSwaps();

  // Fetch availability requests
  const {
    availabilityRequests,
    isLoading: availabilityLoading,
    error: availabilityError,
    approveAvailabilityRequest,
    rejectAvailabilityRequest
  } = useAvailability();

  // Format and count pending requests
  const pendingSwaps = swapRequests?.filter(swap => swap.status === 'Pending') || [];
  const pendingAvailabilityRequests = availabilityRequests?.filter(req => req.status === 'Pending') || [];
  
  const pendingSwapsCount = pendingSwaps.length;
  const pendingAvailabilityCount = pendingAvailabilityRequests.length;

  if (swapsLoading || availabilityLoading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex justify-center items-center h-40">
            <p className="text-muted-foreground">Loading schedule requests...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (availabilityError) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex justify-center items-center h-40">
            <p className="text-destructive">Error loading requests</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatRequestDate = (date: string) => {
    try {
      return format(new Date(date), 'MMM d, yyyy');
    } catch (error) {
      console.error("Date formatting error:", error);
      return date;
    }
  };

  return (
    <Card>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-2">
          <TabsTrigger value="shift-swaps" className="relative">
            Shift Swaps
            {pendingSwapsCount > 0 && (
              <span className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {pendingSwapsCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="availability" className="relative">
            Availability
            {pendingAvailabilityCount > 0 && (
              <span className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {pendingAvailabilityCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="shift-swaps" className="mt-0">
          <ShiftSwapTabContent 
            swapRequests={swapRequests} 
            handleAcceptSwap={handleAcceptSwap}
            handleRejectSwap={handleRejectSwap}
            canManage={canManageRequests}
            formatDate={formatRequestDate}
          />
        </TabsContent>
        
        <TabsContent value="availability" className="mt-0">
          <AvailabilityRequestList
            requests={availabilityRequests}
            onApprove={approveAvailabilityRequest}
            onReject={rejectAvailabilityRequest}
            canManage={canManageRequests}
            formatDate={formatRequestDate}
          />
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default ScheduleRequestsTab;
