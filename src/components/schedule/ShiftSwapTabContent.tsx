
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
              <Clock className="h-12 w-12 text-gray-300 mb-3" />
              <p className="font-medium">No pending shift swap requests</p>
              <p className="text-sm mt-1">
                {canApproveSwaps 
                  ? "There are no shift swap requests waiting for your review." 
                  : "You don't have any pending shift swap requests."}
              </p>
            </>
          )}
          
          {activeTab === 'approved' && (
            <>
              <Check className="h-12 w-12 text-gray-300 mb-3" />
              <p className="font-medium">No approved shift swaps</p>
              <p className="text-sm mt-1">
                Approved shift swaps will appear here.
              </p>
            </>
          )}
          
          {activeTab === 'rejected' && (
            <>
              <X className="h-12 w-12 text-gray-300 mb-3" />
              <p className="font-medium">No rejected shift swaps</p>
              <p className="text-sm mt-1">
                Rejected shift swaps will appear here.
              </p>
            </>
          )}
          
          {activeTab === 'completed' && (
            <>
              <AlertCircle className="h-12 w-12 text-gray-300 mb-3" />
              <p className="font-medium">No completed shift swaps</p>
              <p className="text-sm mt-1">
                Completed shift swaps will appear here.
              </p>
            </>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-3 mt-2">
      {swaps.map((swap) => (
        <div key={swap.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">
                  {getEmployeeName(swap.requester_id)} 
                  <span className="text-gray-500"> → </span>
                  {swap.recipient_id ? getEmployeeName(swap.recipient_id) : 'Any Available Employee'}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {getScheduleDetails(swap.requester_schedule_id)}
                </div>
              </div>
              <div>
                {renderStatusBadge(swap.status)}
                <div className="text-xs text-gray-500 mt-1">
                  {format(new Date(swap.created_at), 'MMM d, yyyy')}
                </div>
              </div>
            </div>
            
            {swap.recipient_schedule_id && (
              <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded border">
                <span className="font-medium">In exchange for:</span> {getScheduleDetails(swap.recipient_schedule_id)}
              </div>
            )}
            
            {swap.notes && (
              <div className="text-sm text-gray-600 italic">
                Note: {swap.notes}
              </div>
            )}
            
            {activeTab === 'pending' && canApproveSwaps && (
              <div className="flex justify-end gap-2 mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  onClick={() => onReject(swap)}
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                  onClick={() => onApprove(swap)}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Approve
                </Button>
              </div>
            )}
            
            {activeTab === 'approved' && (swap.requester_id === userId || canApproveSwaps) && (
              <div className="flex justify-end gap-2 mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  onClick={() => onComplete(swap)}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Mark as Completed
                </Button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ShiftSwapTabContent;
