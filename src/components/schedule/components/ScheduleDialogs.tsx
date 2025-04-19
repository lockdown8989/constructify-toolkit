
import React from 'react';
import { format, parseISO } from 'date-fns';
import { Schedule, useUpdateSchedule } from '@/hooks/use-schedules';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { sendNotification } from '@/services/notifications/notification-sender';
import { supabase } from '@/integrations/supabase/client';

interface ScheduleDialogsProps {
  selectedSchedule: Schedule | null;
  isInfoDialogOpen: boolean;
  setIsInfoDialogOpen: (open: boolean) => void;
  isCancelDialogOpen: boolean;
  setIsCancelDialogOpen: (open: boolean) => void;
}

export const ScheduleDialogs: React.FC<ScheduleDialogsProps> = ({
  selectedSchedule,
  isInfoDialogOpen,
  setIsInfoDialogOpen,
  isCancelDialogOpen,
  setIsCancelDialogOpen,
}) => {
  const { user } = useAuth();
  const { updateSchedule, isUpdating } = useUpdateSchedule();

  const handleCancelShift = async (scheduleId: string) => {
    if (!selectedSchedule) return;
    
    try {
      // Update the schedule status to 'rejected'
      await updateSchedule({
        ...selectedSchedule,
        status: 'rejected'
      });

      // If we have a user, send notification to managers
      if (user) {
        // Get employee details
        const { data: employee } = await supabase
          .from('employees')
          .select('name')
          .eq('user_id', user.id)
          .single();

        // Find managers to notify
        const { data: managers } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'manager');
        
        if (managers && managers.length > 0) {
          const shiftDate = format(parseISO(selectedSchedule.start_time), 'MMMM d, yyyy');
          const shiftTime = format(parseISO(selectedSchedule.start_time), 'h:mm a');
          
          // Notify all managers
          for (const manager of managers) {
            await sendNotification({
              user_id: manager.user_id,
              title: '❌ Shift Cancellation Request',
              message: `${employee?.name || 'An employee'} has requested to cancel their shift on ${shiftDate} at ${shiftTime}.`,
              type: 'warning',
              related_entity: 'schedules',
              related_id: scheduleId
            });
          }
        }
      }

      toast.success("Shift cancellation request sent.");
      setIsCancelDialogOpen(false);
    } catch (error) {
      console.error('Error cancelling shift:', error);
      toast.error("Failed to cancel shift. Please try again.");
    }
  };

  return (
    <>
      <Dialog open={isInfoDialogOpen} onOpenChange={setIsInfoDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Shift Details</DialogTitle>
          </DialogHeader>
          {selectedSchedule && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-gray-500">Date</h4>
                  <p>{format(parseISO(selectedSchedule.start_time), 'MMMM d, yyyy')}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-500">Time</h4>
                  <p>
                    {format(parseISO(selectedSchedule.start_time), 'h:mm a')} - 
                    {format(parseISO(selectedSchedule.end_time), 'h:mm a')}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-500">Location</h4>
                  <p>{selectedSchedule.location || 'Kings Cross'}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-500">Break</h4>
                  <p>30 minutes (unpaid)</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm text-gray-500">Staff working</h4>
                <ul className="list-disc list-inside">
                  <li>Williams</li>
                  <li>Thompson</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm text-gray-500">Managers on duty</h4>
                <ul className="list-disc list-inside">
                  <li>Jane Cooper</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm text-gray-500">Notes</h4>
                <p>{selectedSchedule.notes || 'No additional notes'}</p>
              </div>
            </div>
          )}
          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsInfoDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Shift</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this shift? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCancelDialogOpen(false)}
              disabled={isUpdating}
            >
              No, keep shift
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => selectedSchedule?.id && handleCancelShift(selectedSchedule.id)}
              disabled={isUpdating}
            >
              Yes, cancel shift
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
