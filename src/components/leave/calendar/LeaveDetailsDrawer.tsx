
import React from 'react';
import { format } from 'date-fns';
import { X, User, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { LeaveCalendar } from '@/hooks/leave/leave-types';
import { cn } from '@/lib/utils';

const LEAVE_TYPE_COLORS = {
  'Holiday': 'bg-blue-500',
  'Sickness': 'bg-red-500', 
  'Personal': 'bg-purple-500',
  'Parental': 'bg-green-500',
  'Other': 'bg-gray-600',
  'Annual': 'bg-blue-500',
  'Sick': 'bg-red-500'
};

interface LeaveDetailsDrawerProps {
  date: Date;
  leaves: LeaveCalendar[];
  onClose: () => void;
  getEmployeeName: (employeeId: string) => string;
}

export default function LeaveDetailsDrawer({ 
  date, 
  leaves, 
  onClose, 
  getEmployeeName 
}: LeaveDetailsDrawerProps) {
  const isMobile = useIsMobile();

  if (leaves.length === 0) {
    return null;
  }

  const content = (
    <Card className={cn(
      "shadow-xl border-0",
      isMobile ? "rounded-t-2xl rounded-b-none" : "rounded-2xl"
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">
          {format(date, 'EEEE, MMMM d, yyyy')}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 max-h-96 overflow-y-auto">
        {leaves.map((leave) => (
          <div
            key={leave.id}
            className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl"
          >
            <div className={cn(
              "w-4 h-4 rounded-full mt-1 flex-shrink-0",
              LEAVE_TYPE_COLORS[leave.type] || LEAVE_TYPE_COLORS['Other']
            )} />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium text-gray-900">
                  {getEmployeeName(leave.employee_id)}
                </span>
                <Badge variant={leave.status === 'Approved' ? 'default' : 'secondary'}>
                  {leave.status}
                </Badge>
              </div>
              
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span>{leave.type} Leave</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>
                    {format(new Date(leave.start_date), 'MMM d')} - {format(new Date(leave.end_date), 'MMM d')}
                  </span>
                </div>
              </div>
              
              {leave.notes && (
                <div className="mt-2 text-sm text-gray-600 bg-white rounded-lg p-2">
                  {leave.notes}
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  if (isMobile) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
        <div className="w-full bg-white rounded-t-2xl max-h-[80vh] overflow-hidden">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {content}
      </div>
    </div>
  );
}
