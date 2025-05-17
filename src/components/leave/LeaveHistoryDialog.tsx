
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { LeaveEvent, AuditLogEntry } from "@/hooks/leave/leave-types";
import { CheckCircle, Clock, XCircle } from 'lucide-react';

interface LeaveHistoryDialogProps {
  leave: LeaveEvent;
  isOpen: boolean;
  onClose: () => void;
}

const LeaveHistoryDialog: React.FC<LeaveHistoryDialogProps> = ({ leave, isOpen, onClose }) => {
  // Sort audit log by timestamp (newest first)
  const sortedHistory = leave.audit_log 
    ? [...leave.audit_log].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    : [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'Approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'text-yellow-600 border-yellow-200';
      case 'Approved': return 'text-green-600 border-green-200';
      case 'Rejected': return 'text-red-600 border-red-200';
      case 'Created': return 'text-blue-600 border-blue-200';
      default: return 'text-gray-600 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Leave Request History</DialogTitle>
          <DialogDescription>
            {leave.type} Leave from {format(new Date(leave.start_date), 'dd.MM.yyyy')} to {format(new Date(leave.end_date), 'dd.MM.yyyy')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="max-h-[300px] overflow-y-auto py-4">
          {sortedHistory.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm">No history available</p>
          ) : (
            <div className="space-y-4">
              {sortedHistory.map((entry, index) => (
                <div 
                  key={index} 
                  className={`relative pl-5 pb-3 border-l-2 ${getStatusColor(entry.status)}`}
                >
                  {/* Status dot */}
                  <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-white border-2 border-current flex items-center justify-center">
                    {getStatusIcon(entry.status)}
                  </div>
                  
                  {/* Content */}
                  <div className="ml-2">
                    <div className="flex items-center">
                      <h4 className="font-medium text-sm">
                        Status changed to <span className="font-semibold">{entry.status}</span>
                      </h4>
                    </div>
                    
                    <div className="mt-1 text-xs text-gray-500 flex flex-col gap-1">
                      {entry.reviewer_name && (
                        <span>By: {entry.reviewer_name}</span>
                      )}
                      <span className="italic">
                        {format(new Date(entry.timestamp), 'dd.MM.yyyy HH:mm')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <DialogFooter className="sm:justify-center">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LeaveHistoryDialog;
