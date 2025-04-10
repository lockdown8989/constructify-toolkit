
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LeaveTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const LeaveTypeSelector: React.FC<LeaveTypeSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="leaveType">Leave Type</Label>
      <Select
        value={value}
        onValueChange={onChange}
      >
        <SelectTrigger id="leaveType">
          <SelectValue placeholder="Select leave type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Holiday">Holiday</SelectItem>
          <SelectItem value="Sickness">Sickness</SelectItem>
          <SelectItem value="Personal">Personal</SelectItem>
          <SelectItem value="Parental">Parental</SelectItem>
          <SelectItem value="Other">Other</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default LeaveTypeSelector;
