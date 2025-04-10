
import React from 'react';
import { ShiftSwap } from '@/hooks/use-shift-swaps';
import ShiftSwapItem from './ShiftSwapItem';
import ShiftSwapEmptyState from './ShiftSwapEmptyState';

interface ShiftSwapTabContentProps {
  swaps: ShiftSwap[];
  activeTab: string;
  getEmployeeName: (userId: string) => string;
  getScheduleDetails: (scheduleId: string) => string;
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
    return <ShiftSwapEmptyState statusType={activeTab} />;
  }

  return (
    <div className="space-y-4">
      {swaps.map(swap => (
        <ShiftSwapItem
          key={swap.id}
          swap={swap}
          getEmployeeName={getEmployeeName}
          getScheduleDetails={getScheduleDetails}
          renderStatusBadge={renderStatusBadge}
          onApprove={onApprove}
          onReject={onReject}
          onComplete={onComplete}
          canTakeAction={canApproveSwaps || userId === swap.recipient_id}
        />
      ))}
    </div>
  );
};

export default ShiftSwapTabContent;
