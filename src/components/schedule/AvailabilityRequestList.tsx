
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
import { AvailabilityRequest } from '@/types/availability';

interface AvailabilityRequestListProps {
  requests: AvailabilityRequest[];
}

const AvailabilityRequestList: React.FC<AvailabilityRequestListProps> = ({ requests }) => {
  const updateMutation = useUpdateAvailability();

  const handleApprove = (id: string) => {
    updateMutation.mutate({ id, status: 'Approved' });
  };

  const handleReject = (id: string) => {
    updateMutation.mutate({ id, status: 'Rejected' });
  };

  return (
    <div className="space-y-4">
      {requests.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No availability requests found
        </div>
      ) : (
        requests.map((request) => (
          <Card key={request.id}>
            <CardHeader>
              <CardTitle>
                {request.employees?.name || 'Employee'} - {format(new Date(request.date), 'MM/dd/yyyy')}
              </CardTitle>
              <CardDescription>
                {request.start_time} - {request.end_time}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div>
                <Badge variant={request.status === 'Approved' ? 'default' : 'destructive'}>
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
        ))
      )}
    </div>
  );
};

export default AvailabilityRequestList;
