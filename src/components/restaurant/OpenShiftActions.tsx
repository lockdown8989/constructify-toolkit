
import { OpenShift } from '@/types/restaurant-schedule';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface OpenShiftActionsProps {
  addOpenShift: (openShift: Omit<OpenShift, 'id'>) => void;
}

const OpenShiftActions = ({ addOpenShift }: OpenShiftActionsProps) => {
  const { toast } = useToast();

  const handleAddOpenShift = () => {
    // Get the current date
    const today = new Date();
    // Format as YYYY-MM-DD
    const dateString = today.toISOString().split('T')[0];
    
    // Create proper ISO date-time strings for start and end times
    const startTimeISO = new Date(`${dateString}T09:00:00`).toISOString();
    const endTimeISO = new Date(`${dateString}T17:00:00`).toISOString();
    
    const newOpenShift: Omit<OpenShift, 'id'> = {
      title: 'New Open Shift',
      day: 'monday',
      role: 'Staff',
      startTime: '09:00',
      endTime: '17:00',
      start_time: startTimeISO,
      end_time: endTimeISO,
      notes: 'New open shift',
      status: 'open',
      created_platform: 'web',
      last_modified_platform: 'web',
      mobile_notification_sent: false
    };
    
    addOpenShift(newOpenShift);
    
    toast({
      title: "Open shift added",
      description: "A new open shift has been added to Monday",
    });
  };

  return (
    <Button 
      onClick={handleAddOpenShift}
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
    >
      Add Open Shift
    </Button>
  );
};

export default OpenShiftActions;
