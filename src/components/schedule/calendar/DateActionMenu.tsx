
import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar, UserPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

  // Function to log calendar actions
  const logCalendarAction = async (actionType: string) => {
    if (!user) return;
    
    try {
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
    if (onAddShift) {
      await logCalendarAction('open_add_shift_dialog');
      onAddShift();
    }
  };

  // Handle add employee with logging
  const handleAddEmployee = async () => {
    if (onAddEmployee) {
      await logCalendarAction('open_add_employee_dialog');
      onAddEmployee();
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
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <Button
            onClick={handleAddShift}
            className="flex items-center gap-2"
            disabled={!hasManagerAccess}
          >
            <Calendar className="h-5 w-5" />
            Add shift
          </Button>
          
          <Button
            onClick={handleAddEmployee}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            disabled={!hasManagerAccess}
          >
            <UserPlus className="h-5 w-5" />
            Add employee
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DateActionMenu;
