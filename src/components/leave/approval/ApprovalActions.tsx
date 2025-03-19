
import React from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeaveCalendar } from "@/hooks/leave-calendar";

interface ApprovalActionsProps {
  leave: LeaveCalendar;
  onApprove: (leave: LeaveCalendar) => void;
  onReject: (leave: LeaveCalendar) => void;
}

const ApprovalActions: React.FC<ApprovalActionsProps> = ({
  leave,
  onApprove,
  onReject,
}) => {
  return (
    <div className="flex space-x-2">
      <Button 
        size="sm" 
        variant="outline" 
        className="h-8 w-8 p-0" 
        onClick={() => onApprove(leave)}
      >
        <Check className="h-4 w-4 text-green-500" />
      </Button>
      <Button 
        size="sm" 
        variant="outline" 
        className="h-8 w-8 p-0" 
        onClick={() => onReject(leave)}
      >
        <X className="h-4 w-4 text-red-500" />
      </Button>
    </div>
  );
};

export default ApprovalActions;
