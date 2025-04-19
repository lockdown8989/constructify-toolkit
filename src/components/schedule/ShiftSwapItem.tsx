
import React from 'react';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/auth';
import { ShiftSwap } from '@/hooks/use-shift-swaps';
import { useEmployees } from '@/hooks/use-employees';
import { useSchedules } from '@/hooks/use-schedules';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Check, X, Clock, Trash2 } from 'lucide-react';

interface ShiftSwapItemProps {
  swap: ShiftSwap;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
}

const ShiftSwapItem = ({ swap, onApprove, onReject, onDelete }: ShiftSwapItemProps) => {
  const { isManager } = useAuth();
  const { data: employees = [] } = useEmployees();
  const { data: schedules = [] } = useSchedules();

  const requester = employees.find(e => e.id === swap.requester_id);
  const recipient = employees.find(e => e.id === swap.recipient_id);
  const requesterSchedule = schedules.find(s => s.id === swap.requester_schedule_id);
  const recipientSchedule = swap.recipient_schedule_id 
    ? schedules.find(s => s.id === swap.recipient_schedule_id)
    : null;

  const statusColors = {
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
    Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Rejected: 'bg-rose-50 text-rose-700 border-rose-200',
    Completed: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  // Render a safe badge with status
  const renderBadge = () => {
    const colorClass = statusColors[swap.status as keyof typeof statusColors] || 'bg-gray-50 text-gray-700 border-gray-200';
    
    return (
      <Badge className={colorClass}>
        {swap.status === 'Pending' && <Clock className="h-3.5 w-3.5 mr-1" />}
        {swap.status === 'Approved' && <Check className="h-3.5 w-3.5 mr-1" />}
        {swap.status === 'Rejected' && <X className="h-3.5 w-3.5 mr-1" />}
        {swap.status}
      </Badge>
    );
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {requester?.name} → {recipient?.name || 'Any available employee'}
            </p>
            {requesterSchedule && (
              <p className="text-xs text-gray-500">
                {format(new Date(requesterSchedule.start_time), 'PPP')}
              </p>
            )}
            {swap.notes && (
              <p className="text-xs text-gray-600 mt-2">{swap.notes}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {renderBadge()}
            
            {(isManager || swap.status === 'Pending') && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isManager && swap.status === 'Pending' && (
                    <>
                      <DropdownMenuItem 
                        className="text-emerald-600 focus:text-emerald-600 cursor-pointer"
                        onClick={() => onApprove(swap.id)}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-rose-600 focus:text-rose-600 cursor-pointer"
                        onClick={() => onReject(swap.id)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </DropdownMenuItem>
                    </>
                  )}
                  {(isManager || swap.status === 'Pending') && (
                    <DropdownMenuItem 
                      className="text-gray-600 focus:text-gray-600 cursor-pointer"
                      onClick={() => onDelete(swap.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShiftSwapItem;
