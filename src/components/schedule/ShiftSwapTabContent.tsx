
import React from 'react';
import { format } from 'date-fns';
import { ShiftSwap } from '@/hooks/use-shift-swaps';
import { Button } from '@/components/ui/button';
import { AlertCircle, Check, X, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ShiftSwapTabContentProps {
  swaps: ShiftSwap[];
  activeTab: 'pending' | 'approved' | 'rejected' | 'completed';
  getEmployeeName: (id: string) => string;
  getScheduleDetails: (id: string) => string;
  renderStatusBadge: (status: string) => React.ReactNode;
  onApprove: (swap: ShiftSwap) => void;
  onReject: (swap: ShiftSwap) => void;
  onComplete: (swap: ShiftSwap) => void;
  canApproveSwaps: boolean;
  userId: string;
}

const ShiftSwapTabContent = ({
  swaps,
  activeTab,
  getEmployeeName,
  getScheduleDetails,
  renderStatusBadge,
  onApprove,
  onReject,
  onComplete,
  canApproveSwaps,
  userId
}: ShiftSwapTabContentProps) => {
  if (swaps.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="flex flex-col items-center justify-center">
          {activeTab === 'pending' && (
            <>
              <Clock className="h-8 w-8 mb-2 text-gray-400" />
              <p>No pending shift swap requests</p>
            </>
          )}
          {activeTab === 'approved' && (
            <>
              <Check className="h-8 w-8 mb-2 text-gray-400" />
              <p>No approved shift swaps</p>
            </>
          )}
          {activeTab === 'rejected' && (
            <>
              <X className="h-8 w-8 mb-2 text-gray-400" />
              <p>No rejected shift swaps</p>
            </>
          )}
          {activeTab === 'completed' && (
            <>
              <Check className="h-8 w-8 mb-2 text-gray-400" />
              <p>No completed shift swaps</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {swaps.map((swap) => (
        <div 
          key={swap.id} 
          className="p-4 border rounded-lg shadow-sm bg-white"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="font-medium">
                {getEmployeeName(swap.requester_id)} → {swap.recipient_id ? getEmployeeName(swap.recipient_id) : 'Any available employee'}
              </p>
              <p className="text-sm text-gray-500">
                Created: {format(new Date(swap.created_at), 'MMM d, yyyy')}
              </p>
            </div>
            <div>
              {renderStatusBadge(swap.status)}
            </div>
          </div>
          
          <div className="mb-3">
            <div className="text-sm">
              <span className="font-medium">Requesting to swap:</span> {getScheduleDetails(swap.requester_schedule_id)}
            </div>
            {swap.recipient_schedule_id && (
              <div className="text-sm mt-1">
                <span className="font-medium">With shift:</span> {getScheduleDetails(swap.recipient_schedule_id)}
              </div>
            )}
          </div>
          
          {swap.notes && (
            <div className="text-sm bg-gray-50 p-2 rounded-md mb-3">
              <span className="font-medium">Notes:</span> {swap.notes}
            </div>
          )}
          
          {canApproveSwaps && swap.status === 'Pending' && (
            <div className="flex gap-2 mt-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-green-500 text-green-600 hover:bg-green-50"
                onClick={() => onApprove(swap)}
              >
                <Check className="h-4 w-4 mr-1" /> Approve
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-red-500 text-red-600 hover:bg-red-50"
                onClick={() => onReject(swap)}
              >
                <X className="h-4 w-4 mr-1" /> Reject
              </Button>
            </div>
          )}
          
          {canApproveSwaps && swap.status === 'Approved' && (
            <div className="flex gap-2 mt-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-blue-500 text-blue-600 hover:bg-blue-50"
                onClick={() => onComplete(swap)}
              >
                Mark as Completed
              </Button>
            </div>
          )}
          
          {swap.requester_id === userId && swap.status === 'Pending' && (
            <div className="mt-3 text-sm text-gray-500 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1 text-amber-500" />
              Awaiting approval
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ShiftSwapTabContent;
