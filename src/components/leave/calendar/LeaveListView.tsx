
import React from "react";
import { format } from "date-fns";
import type { LeaveCalendar } from "@/hooks/leave/leave-types";
import { getTypeColor, getStatusColor } from "./utils";
import { Badge } from "@/components/ui/badge";

interface LeaveListViewProps {
  leaves: LeaveCalendar[];
  getEmployeeName: (employeeId: string) => string;
}

const LeaveListView: React.FC<LeaveListViewProps> = ({
  leaves,
  getEmployeeName
}) => {
  const sortedLeaves = [...leaves].sort((a, b) => 
    new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
  );
  
  if (sortedLeaves.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No leave requests found matching the current filters.
      </div>
    );
  }
  
  return (
    <div className="space-y-3 mt-4">
      {sortedLeaves.map(leave => (
        <div 
          key={leave.id} 
          className="border rounded-md p-3 hover:bg-gray-50 transition-colors"
        >
          <div className="flex justify-between items-start">
            <div className="flex gap-3">
              <div className={`w-3 h-3 rounded-full mt-1.5 ${getTypeColor(leave.type)}`}></div>
              
              <div>
                <h4 className="font-medium">{getEmployeeName(leave.employee_id)}</h4>
                <div className="flex gap-1 items-center text-sm text-gray-600">
                  <span>{format(new Date(leave.start_date), 'MMM d, yyyy')}</span>
                  {leave.start_date !== leave.end_date && (
                    <>
                      <span>-</span>
                      <span>{format(new Date(leave.end_date), 'MMM d, yyyy')}</span>
                    </>
                  )}
                </div>
                {leave.notes && (
                  <p className="text-sm text-gray-600 mt-1">{leave.notes}</p>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Badge variant="outline" className="capitalize">{leave.type}</Badge>
              <Badge className={`${getStatusColor(leave.status)} capitalize`}>
                {leave.status}
              </Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LeaveListView;
