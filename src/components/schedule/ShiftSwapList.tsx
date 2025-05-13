
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useShiftSwaps } from '@/hooks/useShiftSwaps';
import ShiftSwapItem from './ShiftSwapItem';

export const ShiftSwapList = () => {
  const { swapRequests, isLoading, error, handleAcceptSwap, handleRejectSwap } = useShiftSwaps();
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex justify-center items-center h-40">
            <p className="text-muted-foreground">Loading shift swap requests...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex justify-center items-center h-40">
            <p className="text-destructive">Error loading shift swap requests</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!swapRequests || swapRequests.length === 0) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex justify-center items-center h-40">
            <p className="text-muted-foreground">No shift swap requests</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Shift Swap Requests</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {swapRequests.map((swap) => (
          <ShiftSwapItem 
            key={swap.id}
            swap={swap}
            onApprove={() => handleAcceptSwap(swap.id)}
            onReject={() => handleRejectSwap(swap.id)}
            onDelete={() => console.log('Delete not implemented')}
          />
        ))}
      </CardContent>
    </Card>
  );
};

// Export as default too for backward compatibility
export default ShiftSwapList;
