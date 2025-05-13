
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
import { 
  MoreVertical, 
  Check, 
  X, 
  Clock, 
  Trash2, 
  Calendar, 
  ArrowRight, 
  User
} from 'lucide-react';

export interface ShiftSwapItemProps {
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

  // Format date for display
  const formatShiftDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    return format(date, 'MMM d, yyyy');
  };
  
  // Format time for display
  const formatShiftTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    return format(date, 'h:mm a');
  };

  // Render a safe badge with status
  const renderBadge = () => {
    const colorClass = statusColors[swap.status as keyof typeof statusColors] || 'bg-gray-50 text-gray-700 border-gray-200';
    
    return (
      <Badge className={`px-2.5 py-1 ${colorClass}`}>
        {swap.status === 'Pending' && <Clock className="h-3.5 w-3.5 mr-1.5" />}
        {swap.status === 'Approved' && <Check className="h-3.5 w-3.5 mr-1.5" />}
        {swap.status === 'Rejected' && <X className="h-3.5 w-3.5 mr-1.5" />}
        {swap.status}
      </Badge>
    );
  };

  return (
    <Card className="border shadow-sm hover:shadow transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-gray-900">
                  {requester?.name || 'Unknown Employee'}
                </p>
                <ArrowRight className="h-3.5 w-3.5 text-gray-500" />
                <p className="text-sm font-medium text-gray-900">
                  {recipient?.name || 'Any available employee'}
                </p>
              </div>
              {requesterSchedule && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formatShiftDate(requesterSchedule.start_time)}</span>
                  <span className="mx-1">•</span>
                  <span>{formatShiftTime(requesterSchedule.start_time)} - {formatShiftTime(requesterSchedule.end_time)}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
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
        
        {swap.notes && (
          <div className="bg-gray-50 p-3 rounded-md text-xs text-gray-700 mt-2">
            <p className="font-medium mb-1">Notes:</p>
            <p>{swap.notes}</p>
          </div>
        )}
        
        {isManager && swap.status === 'Pending' && (
          <div className="flex gap-2 mt-3">
            <Button 
              size="sm" 
              variant="outline"
              className="border-green-600 text-green-700 hover:bg-green-50"
              onClick={() => onApprove(swap.id)}
            >
              <Check className="h-4 w-4 mr-1.5" />
              Approve
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="border-red-600 text-red-700 hover:bg-red-50"
              onClick={() => onReject(swap.id)}
            >
              <X className="h-4 w-4 mr-1.5" />
              Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShiftSwapItem;
