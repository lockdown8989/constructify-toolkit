
import React from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import LeaveTypeBadge from "./LeaveTypeBadge";
import ApprovalActions from "./ApprovalActions";
import type { LeaveCalendar } from "@/hooks/leave-calendar";

interface ApprovalTableProps {
  leaves: LeaveCalendar[];
  getEmployeeName: (employeeId: string) => string;
  getEmployeeDepartment: (employeeId: string) => string;
  calculateLeaveDays: (startDate: string, endDate: string) => number;
  onApprove: (leave: LeaveCalendar) => void;
  onReject: (leave: LeaveCalendar) => void;
}

const ApprovalTable: React.FC<ApprovalTableProps> = ({
  leaves,
  getEmployeeName,
  getEmployeeDepartment,
  calculateLeaveDays,
  onApprove,
  onReject,
}) => {
  if (leaves.length === 0) {
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
          {leaves.map((leave) => (
            <TableRow key={leave.id}>
              <TableCell className="font-medium">{getEmployeeName(leave.employee_id)}</TableCell>
              <TableCell>{getEmployeeDepartment(leave.employee_id)}</TableCell>
              <TableCell>
                <LeaveTypeBadge type={leave.type} />
              </TableCell>
              <TableCell>{format(new Date(leave.start_date), "PP")}</TableCell>
              <TableCell>{format(new Date(leave.end_date), "PP")}</TableCell>
              <TableCell>{calculateLeaveDays(leave.start_date, leave.end_date)}</TableCell>
              <TableCell className="max-w-[200px] truncate">{leave.notes || "-"}</TableCell>
              <TableCell>
                <ApprovalActions 
                  leave={leave} 
                  onApprove={onApprove} 
                  onReject={onReject} 
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ApprovalTable;
