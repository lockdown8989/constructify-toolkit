
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar, UserPlus, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEmployees } from '@/hooks/use-employees';
import { createShiftAssignment, createEmployeeWithShift } from '@/utils/calendar-actions';

interface DateActionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onAddShift?: () => void;
  onAddEmployee?: () => void;
  hasManagerAccess?: boolean;
  selectedDate?: Date;
}

const DateActionMenu: React.FC<DateActionMenuProps> = ({
  isOpen,
  onClose,
  onAddShift,
  onAddEmployee,
  hasManagerAccess = false,
  selectedDate
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: employees = [] } = useEmployees({});
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Function to log calendar actions
  const logCalendarAction = async (actionType: string) => {
    if (!user) return;
    
    try {
      console.log(`Logging calendar action: ${actionType}`);
      
      await supabase.from('calendar_actions').insert({
        action_type: actionType,
        date: selectedDate?.toISOString(),
        initiator_id: user.id,
        details: {
          date_selected: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null,
          platform: window.innerWidth < 768 ? 'mobile' : 'desktop'
        }
      });
      
      console.log(`Calendar action logged: ${actionType}`);
    } catch (error) {
      console.error('Error logging calendar action:', error);
    }
  };

  // Handle add shift with logging
  const handleAddShift = async () => {
    try {
      setIsProcessing(true);
      await logCalendarAction('open_add_shift_dialog');

      console.log('Add shift button clicked, selectedDate:', selectedDate);

      if (selectedDate) {
        // Format time to be at the start of business hours (9 AM)
        const startTime = new Date(selectedDate);
        startTime.setHours(9, 0, 0, 0);
        
        // End time is 8 hours later
        const endTime = new Date(startTime);
        endTime.setHours(startTime.getHours() + 8);

        // If direct API call is needed before opening dialog
        console.log('Preparing add shift operation:', {
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString()
        });
        
        await supabase.from('calendar_actions').insert({
          action_type: 'prepare_add_shift',
          date: selectedDate.toISOString(),
          initiator_id: user?.id,
          details: {
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString()
          }
        });
      }
      
      if (onAddShift) {
        console.log('Calling onAddShift callback');
        onAddShift();
      }
      
      toast({
        title: "Add Shift",
        description: "Opening shift creation dialog",
      });
    } catch (error) {
      console.error('Error in handleAddShift:', error);
      toast({
        title: "Error",
        description: "Failed to open shift dialog",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      onClose();
    }
  };

  // Handle add employee with logging
  const handleAddEmployee = async () => {
    try {
      setIsProcessing(true);
      await logCalendarAction('open_add_employee_dialog');
      
      console.log('Add employee button clicked, selectedDate:', selectedDate);
      
      // Prepare data for future employee creation
      if (selectedDate) {
        // Record the intent in database
        await supabase.from('calendar_actions').insert({
          action_type: 'prepare_add_employee',
          date: selectedDate.toISOString(),
          initiator_id: user?.id,
          details: {
            date_selected: format(selectedDate, 'yyyy-MM-dd'),
            existing_employees_count: employees.length
          }
        });
      }
      
      if (onAddEmployee) {
        console.log('Calling onAddEmployee callback');
        onAddEmployee();
      }
      
      toast({
        title: "Add Employee",
        description: "Opening employee creation dialog",
      });
    } catch (error) {
      console.error('Error in handleAddEmployee:', error);
      toast({
        title: "Error", 
        description: "Failed to open employee dialog",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      onClose();
    }
  };

  const dateString = selectedDate 
    ? format(selectedDate, 'EEEE, MMMM d, yyyy')
    : 'Selected Date';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{dateString}</DialogTitle>
          <DialogDescription>
            Choose an action for this date
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <Button
            onClick={handleAddShift}
            className="flex items-center gap-2"
            disabled={!hasManagerAccess || isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Calendar className="h-5 w-5" />
            )}
            Add shift
          </Button>
          
          <Button
            onClick={handleAddEmployee}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            disabled={!hasManagerAccess || isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <UserPlus className="h-5 w-5" />
            )}
            Add employee
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DateActionMenu;
