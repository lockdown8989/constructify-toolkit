
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ShiftSwapStatusBadgeProps {
  status: string;
  className?: string;
}

const ShiftSwapStatusBadge: React.FC<ShiftSwapStatusBadgeProps> = ({ 
  status, 
  className 
}) => {
  switch (status) {
    case 'Approved':
      return (
        <Badge 
          className={cn(
            "bg-green-100 text-green-800 border-green-300",
            className
          )}
        >
          Approved
        </Badge>
      );
    case 'Rejected':
      return (
        <Badge 
          className={cn(
            "bg-red-100 text-red-800 border-red-300",
            className
          )}
        >
          Rejected
        </Badge>
      );
    case 'Completed':
      return (
        <Badge 
          className={cn(
            "bg-blue-100 text-blue-800 border-blue-300",
            className
          )}
        >
          Completed
        </Badge>
      );
    default:
      return (
        <Badge 
          className={cn(
            "bg-yellow-100 text-yellow-800 border-yellow-300",
            className
          )}
        >
          Pending
        </Badge>
      );
  }
};

export default ShiftSwapStatusBadge;
