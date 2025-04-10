
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ShiftSwapStatusBadgeProps {
  status: string;
}

const ShiftSwapStatusBadge = ({ status }: ShiftSwapStatusBadgeProps) => {
  switch (status) {
    case 'Pending':
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
    case 'Approved':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
    case 'Rejected':
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
    case 'Completed':
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Completed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default ShiftSwapStatusBadge;
