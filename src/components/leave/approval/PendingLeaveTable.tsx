
import React from "react";
import { format } from "date-fns";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLeaveApprovals } from "./hooks/useLeaveApprovals";
import type { LeaveCalendar } from "@/hooks/use-leave-calendar";
import type { Employee } from "@/hooks/use-employees";

interface PendingLeaveTableProps {
  leaves: LeaveCalendar[];
  employees: Employee[];
  currentUser: {
    id: string;
    name: string;
    department: string;
    isManager: boolean;
  };
}

const PendingLeaveTable: React.FC<PendingLeaveTableProps> = ({ 
  leaves, 
  employees, 
  currentUser 
}) => {
  const {
    filteredLeaves,
    handleApprove,
    handleReject,
    getEmployeeName,
    getEmployeeDepartment,
    calculateLeaveDays
  } = useLeaveApprovals(leaves, employees, currentUser);
  
  if (filteredLeaves.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        No pending leave requests found
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Days</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredLeaves.map((leave) => (
            <TableRow key={leave.id}>
              <TableCell className="font-medium">{getEmployeeName(leave.employee_id)}</TableCell>
              <TableCell>{getEmployeeDepartment(leave.employee_id)}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  leave.type === "Holiday" ? "bg-blue-100 text-blue-800" :
                  leave.type === "Sickness" ? "bg-red-100 text-red-800" :
                  leave.type === "Personal" ? "bg-purple-100 text-purple-800" :
                  leave.type === "Parental" ? "bg-green-100 text-green-800" :
                  "bg-gray-100 text-gray-800"
                }`}>
                  {leave.type}
                </span>
              </TableCell>
              <TableCell>{format(new Date(leave.start_date), "PP")}</TableCell>
              <TableCell>{format(new Date(leave.end_date), "PP")}</TableCell>
              <TableCell>{calculateLeaveDays(leave.start_date, leave.end_date)}</TableCell>
              <TableCell className="max-w-[200px] truncate">{leave.notes || "-"}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-8 w-8 p-0" 
                    onClick={() => handleApprove(leave)}
                  >
                    <Check className="h-4 w-4 text-green-500" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-8 w-8 p-0" 
                    onClick={() => handleReject(leave)}
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PendingLeaveTable;
