
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export interface AvailabilityRequestFormProps {
  onClose?: () => void;
  // Add any other props your component needs
}

export const AvailabilityRequestForm: React.FC<AvailabilityRequestFormProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Handle form submission logic here
    
    toast({
      title: "Availability request submitted",
      description: "Your availability request has been submitted successfully.",
    });
    
    if (onClose) {
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Date Range</label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Start Date</label>
            <Input type="date" required />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">End Date</label>
            <Input type="date" required />
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Availability Type</label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select availability type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unavailable">Unavailable</SelectItem>
            <SelectItem value="limited">Limited Hours</SelectItem>
            <SelectItem value="preferred">Preferred Hours</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Notes</label>
        <Textarea placeholder="Provide any additional details about your availability" />
      </div>
      
      <div className="flex justify-end space-x-2">
        {onClose && (
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        )}
        <Button type="submit">Submit Request</Button>
      </div>
    </form>
  );
};

export default AvailabilityRequestForm;
