
import React from 'react';
import { format } from 'date-fns';
import { useShiftSwaps, useUpdateShiftSwap, useDeleteShiftSwap } from '@/hooks/use-shift-swaps';
import { useEmployees } from '@/hooks/use-employees';
import { useSchedules } from '@/hooks/use-schedules';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Check, Clock, X, MoreHorizontal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const ShiftSwapList = () => {
  const { user, isManager } = useAuth();
  const { data: swaps = [], isLoading } = useShiftSwaps();
  const { data: employees = [] } = useEmployees();
  const { data: schedules = [] } = useSchedules();
  const { mutate: updateShiftSwap } = useUpdateShiftSwap();
  const { mutate: deleteShiftSwap } = useDeleteShiftSwap();

  const getEmployeeName = (id: string) => {
    const employee = employees.find(e => e.id === id);
    return employee?.name || 'Unknown';
  };

  const getScheduleDetails = (id: string) => {
    const schedule = schedules.find(s => s.id === id);
    if (!schedule) return 'Unknown shift';
    
    const start = new Date(schedule.start_time);
    const end = new Date(schedule.end_time);
    
    return `${schedule.title} (${format(start, 'MMM d')}, ${format(start, 'h:mm a')} - ${format(end, 'h:mm a')})`;
  };

  const handleApprove = (swapId: string) => {
    updateShiftSwap({
      id: swapId,
      status: 'Approved'
    });
  };

  const handleReject = (swapId: string) => {
    updateShiftSwap({
      id: swapId,
      status: 'Rejected'
    });
  };

  const handleDelete = (swapId: string) => {
    deleteShiftSwap(swapId);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-1/3" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (swaps.length === 0) {
    return (
      <div className="text-center p-6">
        <p className="text-muted-foreground">No shift swap requests found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {swaps.map((swap) => {
        const isRequester = user?.id === swap.requester_id;
        const canManage = isManager || isRequester;
        
        return (
          <Card key={swap.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base flex items-center">
                  Shift Swap Request
                  <Badge 
                    className={`ml-2 ${
                      swap.status === 'Approved' 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : swap.status === 'Rejected' 
                        ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                        : swap.status === 'Completed' 
                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
                        : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                    }`}
                  >
                    {swap.status}
                  </Badge>
                </CardTitle>
                {canManage && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {isManager && swap.status === 'Pending' && (
                        <>
                          <DropdownMenuItem onClick={() => handleApprove(swap.id)}>
                            <Check className="mr-2 h-4 w-4 text-green-500" />
                            <span>Approve</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleReject(swap.id)}>
                            <X className="mr-2 h-4 w-4 text-red-500" />
                            <span>Reject</span>
                          </DropdownMenuItem>
                        </>
                      )}
                      {(isRequester && swap.status === 'Pending') && (
                        <DropdownMenuItem onClick={() => handleDelete(swap.id)}>
                          <X className="mr-2 h-4 w-4" />
                          <span>Cancel Request</span>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3 pb-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">From</p>
                  <p className="text-sm font-medium">{getEmployeeName(swap.requester_id)}</p>
                  <p className="text-xs">{getScheduleDetails(swap.requester_schedule_id)}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">To</p>
                  <p className="text-sm font-medium">{getEmployeeName(swap.recipient_id)}</p>
                  {swap.recipient_schedule_id ? (
                    <p className="text-xs">{getScheduleDetails(swap.recipient_schedule_id)}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No specific shift</p>
                  )}
                </div>
              </div>
              
              {swap.notes && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">Notes</p>
                  <p className="text-sm">{swap.notes}</p>
                </div>
              )}
              
              <div className="flex items-center text-xs text-muted-foreground pt-2">
                <Clock className="h-3 w-3 mr-1" />
                <span>
                  Requested on {format(new Date(swap.created_at), 'MMM d, yyyy')} at {format(new Date(swap.created_at), 'h:mm a')}
                </span>
              </div>
            </CardContent>
            
            {isManager && swap.status === 'Pending' && (
              <CardFooter className="pt-0 flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleReject(swap.id)}
                >
                  <X className="mr-1 h-4 w-4" />
                  Reject
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleApprove(swap.id)}
                >
                  <Check className="mr-1 h-4 w-4" />
                  Approve
                </Button>
              </CardFooter>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default ShiftSwapList;
