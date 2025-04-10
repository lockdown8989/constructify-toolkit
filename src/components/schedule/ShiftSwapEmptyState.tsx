
import React from 'react';
import { CalendarX } from 'lucide-react';

interface ShiftSwapEmptyStateProps {
  statusType: string;
}

const ShiftSwapEmptyState = ({ statusType }: ShiftSwapEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-gray-500 border border-dashed border-gray-200 rounded-lg bg-gray-50 min-h-[200px]">
      <CalendarX className="w-12 h-12 mb-3 text-gray-400" />
      <h3 className="text-lg font-medium mb-1">No {statusType} requests</h3>
      <p className="text-sm text-center">
        {statusType === 'Pending' 
          ? 'There are no pending shift swap requests requiring your attention.'
          : statusType === 'Approved'
            ? 'No approved shift swap requests found. Once approved, they will appear here.'
            : statusType === 'Rejected'
              ? 'No rejected shift swap requests found.'
              : 'No shift swap requests found for this status.'}
      </p>
    </div>
  );
};

export default ShiftSwapEmptyState;
