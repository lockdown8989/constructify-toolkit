
import { useState } from 'react';
import { OpenShift } from '@/types/restaurant-schedule';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { PlusCircle, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format, addDays } from 'date-fns';

interface OpenShiftActionsProps {
  addOpenShift: (openShift: Omit<OpenShift, 'id'>) => void;
}

const OpenShiftActions = ({ addOpenShift }: OpenShiftActionsProps) => {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [expirationDays, setExpirationDays] = useState(7);

  const handleAddOpenShift = () => {
    setShowDialog(true);
  };

  const handleSubmit = () => {
    // Get the current date
    const today = new Date();
    // Format as YYYY-MM-DD
    const dateString = today.toISOString().split('T')[0];
    
    // Create proper ISO date-time strings for start and end times
    const startTimeISO = new Date(`${dateString}T09:00:00`).toISOString();
    const endTimeISO = new Date(`${dateString}T17:00:00`).toISOString();
    
    // Calculate the expiration date (default 7 days from now)
    const expirationDate = addDays(new Date(), expirationDays).toISOString();
    
    const newOpenShift: Omit<OpenShift, 'id'> = {
      title: 'New Open Shift',
      day: 'monday',
      role: 'Staff',
      startTime: '09:00',
      endTime: '17:00',
      start_time: startTimeISO,
      end_time: endTimeISO,
      expiration_date: expirationDate,
      notes: 'New open shift',
      status: 'open',
      created_platform: 'web',
      last_modified_platform: 'web',
      mobile_notification_sent: false
    };
    
    addOpenShift(newOpenShift);
    setShowDialog(false);
    
    toast({
      title: "Open shift added",
      description: `A new open shift has been added to Monday with an expiration of ${expirationDays} days`,
    });
  };

  return (
    <>
      <Button 
        onClick={handleAddOpenShift}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
      >
        <PlusCircle className="h-4 w-4 mr-2" />
        Add Open Shift
      </Button>
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Open Shift</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="expirationDays" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Expiration (days)
              </Label>
              <Input
                id="expirationDays"
                type="number"
                min="1"
                max="30"
                value={expirationDays}
                onChange={(e) => setExpirationDays(parseInt(e.target.value))}
                className="col-span-3"
              />
              <p className="text-xs text-gray-500">
                This shift will expire on {format(addDays(new Date(), expirationDays), 'MMMM d, yyyy')}
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit}>
              Create Open Shift
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OpenShiftActions;
