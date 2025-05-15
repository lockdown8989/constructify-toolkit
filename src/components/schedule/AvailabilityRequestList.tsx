
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, CheckCircle, XCircle } from 'lucide-react';
import { useUpdateAvailability } from '@/hooks/availability';
import { format } from 'date-fns';

interface AvailabilityRequest {
  id: string;
  employee_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  status: 'Pending' | 'Approved' | 'Rejected';
  notes?: string;
  manager_notes?: string;
  reviewer_id?: string;
  created_at: string;
  updated_at: string;
  employee_name?: string;
}

interface AvailabilityRequestListProps {
  requests: AvailabilityRequest[];
}

const AvailabilityRequestList: React.FC<AvailabilityRequestListProps> = ({ requests }) => {
  const { updateAvailability } = useUpdateAvailability();

  const handleApprove = (id: string) => {
    updateAvailability({ id, status: 'Approved' });
  };

  const handleReject = (id: string) => {
    updateAvailability({ id, status: 'Rejected' });
  };

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <Card key={request.id}>
          <CardHeader>
            <CardTitle>{request.employee_name || 'Employee'} - {format(new Date(request.date), 'MM/dd/yyyy')}</CardTitle>
            <CardDescription>
              {request.start_time} - {request.end_time}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <Badge variant={request.status === 'Approved' ? 'outline' : 'destructive'}>
                {request.status}
              </Badge>
              <p className="text-sm text-gray-500 mt-2">
                {request.notes}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleApprove(request.id)}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleReject(request.id)}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AvailabilityRequestList;
