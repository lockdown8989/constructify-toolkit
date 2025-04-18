
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, X } from 'lucide-react';

interface ApprovalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  managerNotes: string;
  onNotesChange: (notes: string) => void;
  employeeName?: string;
}

const ApprovalDialog = ({
  isOpen,
  onClose,
  onApprove,
  onReject,
  managerNotes,
  onNotesChange,
  employeeName,
}: ApprovalDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review Availability Request</DialogTitle>
          <DialogDescription>
            Review and respond to the availability request from {employeeName}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Manager Notes</label>
            <Textarea
              value={managerNotes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Add any notes or feedback about this request..."
              className="mt-1"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="destructive"
              onClick={onReject}
            >
              <X className="h-4 w-4 mr-1" />
              Reject
            </Button>
            <Button
              onClick={onApprove}
            >
              <Check className="h-4 w-4 mr-1" />
              Approve
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApprovalDialog;
