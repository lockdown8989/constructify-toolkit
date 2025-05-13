
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { AvailabilityStatus } from '@/types/availability';

interface StatusBadgeProps {
  status: AvailabilityStatus;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  switch (status) {
    case 'Approved':
      return (
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center">
          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
          Approved
        </Badge>
      );
    case 'Rejected':
      return (
        <Badge className="bg-rose-50 text-rose-700 border-rose-200 flex items-center">
          <XCircle className="h-3.5 w-3.5 mr-1" />
          Rejected
        </Badge>
      );
    default:
      return (
        <Badge className="bg-amber-50 text-amber-700 border-amber-200 flex items-center">
          <AlertCircle className="h-3.5 w-3.5 mr-1" />
          Pending
        </Badge>
      );
  }
};

export default StatusBadge;
