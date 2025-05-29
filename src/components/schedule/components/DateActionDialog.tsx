
import React from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarPlus, UserPlus, X } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

interface DateActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  onAddShift: () => void;
  onAddEmployee?: () => void;
}

const DateActionDialog: React.FC<DateActionDialogProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onAddShift,
  onAddEmployee
}) => {
  const { toast } = useToast();

  if (!selectedDate) return null;

  const handleAddShift = () => {
    onAddShift();
    toast({
      title: "Creating Shift",
      description: `Setting up a new shift for ${format(selectedDate, 'MMMM d, yyyy')}`,
      variant: "default"
    });
  };

  const handleAddEmployee = () => {
    if (onAddEmployee) {
      onAddEmployee();
      toast({
        title: "Adding Employee",
        description: `Assigning employee for ${format(selectedDate, 'MMMM d, yyyy')}`,
        variant: "default"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-gray-600 text-base mt-2">
            Choose an action for this date
          </p>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 mt-6">
          <Button
            onClick={handleAddShift}
            className="w-full h-14 bg-gray-800 hover:bg-gray-900 text-white rounded-2xl transition-all duration-200 hover:scale-105"
            size="lg"
          >
            <CalendarPlus className="h-5 w-5 mr-3" />
            Add shift
          </Button>
          
          {onAddEmployee && (
            <Button
              onClick={handleAddEmployee}
              className="w-full h-14 bg-green-600 hover:bg-green-700 text-white rounded-2xl transition-all duration-200 hover:scale-105"
              size="lg"
            >
              <UserPlus className="h-5 w-5 mr-3" />
              Add employee
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DateActionDialog;
