
import React from 'react';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { ShiftSwap } from '@/hooks/use-shift-swaps';

interface ShiftSwapItemProps {
  swap: ShiftSwap;
  getEmployeeName: (userId: string) => string;
  getScheduleDetails: (scheduleId: string) => string;
  renderStatusBadge: (status: string) => React.ReactNode;
  onApprove?: (swap: ShiftSwap) => void;
  onReject?: (swap: ShiftSwap) => void;
  onComplete?: (swap: ShiftSwap) => void;
  canTakeAction: boolean;
}

const ShiftSwapItem = ({
  swap,
  getEmployeeName,
  getScheduleDetails,
  renderStatusBadge,
  onApprove,
  onReject,
  onComplete,
  canTakeAction
}: ShiftSwapItemProps) => {
  const renderActions = () => {
    if (swap.status === 'Pending' && canTakeAction) {
      return (
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" className="text-green-600" onClick={() => onApprove?.(swap)}>
            <Check className="h-4 w-4 mr-1" />
            Approve
          </Button>
          <Button size="sm" variant="outline" className="text-red-600" onClick={() => onReject?.(swap)}>
            <X className="h-4 w-4 mr-1" />
            Reject
          </Button>
        </div>
      );
    }
    
    if (swap.status === 'Approved' && canTakeAction) {
      return (
        <Button size="sm" variant="outline" onClick={() => onComplete?.(swap)}>
          <Check className="h-4 w-4 mr-1" />
          Mark Completed
        </Button>
      );
    }
    
    return null;
  };

  return (
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
        {renderActions()}
      </div>
    </div>
  );
};

export default ShiftSwapItem;
