
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { AvailabilityRequest } from '@/types/availability';

interface AvailabilityRequestListProps {
  requests: AvailabilityRequest[] | undefined;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  canManage: boolean;
  formatDate: (date: string) => string;
}

export const AvailabilityRequestList: React.FC<AvailabilityRequestListProps> = ({
  requests,
  onApprove,
  onReject,
  canManage,
  formatDate
}) => {
  if (!requests || requests.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-muted-foreground">No availability requests found</p>
      </div>
    );
  }

  const formatTime = (time: string) => {
    if (!time) return '';
    
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch {
      return time;
    }
  };

  return (
    <div className="space-y-4 p-4">
      {requests.map((request) => (
        <Card key={request.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">
                  <span className="font-semibold">{request.employees?.name || "Employee"}</span>
                  {' '}is {request.is_available ? 'available' : 'unavailable'}
                </p>
                
                <p className="text-sm text-muted-foreground mt-1">
                  Date: {formatDate(request.date)} 
                </p>
                
                <p className="text-sm text-muted-foreground">
                  Time: {formatTime(request.start_time)} - {formatTime(request.end_time)}
                </p>
                
                {request.notes && (
                  <p className="text-sm mt-2 border-l-2 border-gray-200 pl-2 italic">
                    {request.notes}
                  </p>
                )}
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <div className={`
                  px-2 py-1 rounded text-xs font-medium
                  ${request.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                    request.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                    'bg-red-100 text-red-800'}
                `}>
                  {request.status}
                </div>
                
                {canManage && request.status === 'Pending' && (
                  <div className="flex gap-2 mt-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-8 border-green-500 text-green-600 hover:bg-green-50"
                      onClick={() => onApprove(request.id)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-8 border-red-500 text-red-600 hover:bg-red-50"
                      onClick={() => onReject(request.id)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AvailabilityRequestList;
