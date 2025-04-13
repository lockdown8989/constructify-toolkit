
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  CircleCheck 
} from 'lucide-react';

interface ShiftSwapStatusBadgeProps {
  status: string;
}

const ShiftSwapStatusBadge = ({ status }: ShiftSwapStatusBadgeProps) => {
  switch (status) {
    case 'Pending':
      return (
        <Badge 
          className="bg-yellow-100 text-yellow-800 border border-yellow-300 flex items-center"
        >
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    case 'Approved':
      return (
        <Badge 
          className="bg-green-100 text-green-800 border border-green-300 flex items-center"
        >
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Approved
        </Badge>
      );
    case 'Rejected':
      return (
        <Badge 
          className="bg-red-100 text-red-800 border border-red-300 flex items-center"
        >
          <XCircle className="h-3 w-3 mr-1" />
          Rejected
        </Badge>
      );
    case 'Completed':
      return (
        <Badge 
          className="bg-blue-100 text-blue-800 border border-blue-300 flex items-center"
        >
          <CircleCheck className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      );
    default:
      return (
        <Badge>
          {status}
        </Badge>
      );
  }
};

export default ShiftSwapStatusBadge;
