
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { OpenShiftType } from '@/types/supabase/schedules';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';

interface ShiftAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  shift: OpenShiftType | null;
  employees: { id: string; name: string }[];
  onAssign: (employeeId: string) => void;
}

export const ShiftAssignmentDialog: React.FC<ShiftAssignmentDialogProps> = ({
  isOpen,
  onClose,
  shift,
  employees,
  onAssign,
}) => {
  if (!shift) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Shift</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-sm mb-2">{shift.title}</h4>
            <p className="text-sm text-gray-600">
              {format(new Date(shift.start_time), 'PPP')} at {' '}
              {format(new Date(shift.start_time), 'p')} - {format(new Date(shift.end_time), 'p')}
            </p>
            {shift.location && (
              <p className="text-sm text-gray-600 mt-1">
                📍 {shift.location}
              </p>
            )}
          </div>

          <div className="space-y-2">
            {employees.map((employee) => (
              <Button
                key={employee.id}
                variant="outline"
                className="w-full justify-start h-auto py-3"
                onClick={() => onAssign(employee.id)}
              >
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                {employee.name}
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
