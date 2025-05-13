
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { ShiftSwap } from '@/hooks/use-shift-swaps';

interface ShiftSwapTabContentProps {
  swapRequests: ShiftSwap[] | undefined;
  handleAcceptSwap: (id: string) => void;
  handleRejectSwap: (id: string) => void;
  canManage: boolean;
  formatDate: (date: string) => string;
}

export const ShiftSwapTabContent: React.FC<ShiftSwapTabContentProps> = ({
  swapRequests = [],
  handleAcceptSwap,
  handleRejectSwap,
  canManage,
  formatDate
}) => {
  const pendingSwaps = swapRequests.filter(swap => swap.status === 'Pending');
  const approvedSwaps = swapRequests.filter(swap => swap.status === 'Approved');
  const rejectedSwaps = swapRequests.filter(swap => swap.status === 'Rejected');
  const completedSwaps = swapRequests.filter(swap => swap.status === 'Completed');
  
  if (swapRequests.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <p>No shift swap requests found.</p>
        <p className="text-sm mt-2">
          Shift swap requests will appear here when employees request to swap shifts.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {pendingSwaps.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Pending Requests</h3>
          <div className="space-y-3">
            {pendingSwaps.map(swap => (
              <div key={swap.id} className="p-4 border rounded-lg bg-white shadow-sm">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{swap.requester_id}</p>
                    <p className="text-sm text-gray-500">Requested: {formatDate(swap.created_at)}</p>
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                    Pending
                  </span>
                </div>
                
                {swap.notes && (
                  <div className="mt-2 text-sm bg-gray-50 p-2 rounded">
                    <span className="font-medium">Notes:</span> {swap.notes}
                  </div>
                )}
                
                {canManage && (
                  <div className="flex gap-2 mt-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-green-500 text-green-600 hover:bg-green-50"
                      onClick={() => handleAcceptSwap(swap.id)}
                    >
                      <Check className="h-4 w-4 mr-1" /> Approve
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-red-500 text-red-600 hover:bg-red-50"
                      onClick={() => handleRejectSwap(swap.id)}
                    >
                      <X className="h-4 w-4 mr-1" /> Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {approvedSwaps.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Approved Requests</h3>
          <div className="space-y-3">
            {approvedSwaps.map(swap => (
              <div key={swap.id} className="p-4 border rounded-lg bg-white shadow-sm">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{swap.requester_id}</p>
                    <p className="text-sm text-gray-500">Updated: {formatDate(swap.updated_at)}</p>
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                    Approved
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {rejectedSwaps.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Rejected Requests</h3>
          <div className="space-y-3">
            {rejectedSwaps.map(swap => (
              <div key={swap.id} className="p-4 border rounded-lg bg-white shadow-sm">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{swap.requester_id}</p>
                    <p className="text-sm text-gray-500">Updated: {formatDate(swap.updated_at)}</p>
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                    Rejected
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {completedSwaps.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Completed Swaps</h3>
          <div className="space-y-3">
            {completedSwaps.map(swap => (
              <div key={swap.id} className="p-4 border rounded-lg bg-white shadow-sm">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{swap.requester_id}</p>
                    <p className="text-sm text-gray-500">Completed: {formatDate(swap.updated_at)}</p>
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                    Completed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
