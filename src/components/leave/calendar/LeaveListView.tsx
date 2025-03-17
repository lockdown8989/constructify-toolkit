
import React from "react";
import { format } from "date-fns";
import type { LeaveCalendar } from "@/hooks/use-leave-calendar";
import { getTypeColor, getStatusColor } from "./utils";

interface LeaveListViewProps {
  leaves: LeaveCalendar[];
  getEmployeeName: (employeeId: string) => string;
}

const LeaveListView: React.FC<LeaveListViewProps> = ({ leaves, getEmployeeName }) => {
  return (
    <div className="divide-y">
      {leaves.length === 0 ? (
        <div className="py-4 text-center text-muted-foreground">
          No leave requests found
        </div>
      ) : (
        leaves.map(leave => (
          <div key={leave.id} className="py-3 flex items-center">
            <div className={`w-3 h-3 rounded-full ${getTypeColor(leave.type)} mr-3`}></div>
            <div className="flex-1">
              <div className="font-medium">{getEmployeeName(leave.employee_id)}</div>
              <div className="text-sm text-muted-foreground">
                {format(new Date(leave.start_date), "PPP")} - {format(new Date(leave.end_date), "PPP")}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm">{leave.type}</div>
              <div className={`px-2 py-1 rounded text-xs text-white ${getStatusColor(leave.status)}`}>
                {leave.status}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default LeaveListView;
