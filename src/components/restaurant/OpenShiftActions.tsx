
import { OpenShift } from '@/types/restaurant-schedule';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface OpenShiftActionsProps {
  addOpenShift: (openShift: Omit<OpenShift, 'id'>) => void;
}

const OpenShiftActions = ({ addOpenShift }: OpenShiftActionsProps) => {
  const { toast } = useToast();

  const handleAddOpenShift = () => {
    const newOpenShift: Omit<OpenShift, 'id'> = {
      day: 'monday',
      startTime: '09:00',
      endTime: '17:00',
      role: 'Staff',
      notes: 'New open shift'
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
