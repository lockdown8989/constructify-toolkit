
import React from 'react';
import { format } from 'date-fns';
import { useAvailabilityRequests } from '@/hooks/availability';
import { useEmployees } from '@/hooks/use-employees';
import { useAuth } from '@/hooks/use-auth';
import { Clock, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const AvailabilityRequestList = () => {
  const { data: requests = [], isLoading: isLoadingRequests, isError, error } = useAvailabilityRequests();
  const { data: employees = [], isLoading: isLoadingEmployees } = useEmployees();
  const { user } = useAuth();
  
  // Get current employee
  const currentEmployee = user ? employees.find(emp => emp.user_id === user.id) : null;
  
  // Determine if we're still loading data
  const isLoading = isLoadingRequests || isLoadingEmployees;
  
  if (isLoading) {
    return (
      <div className="space-y-3 mt-2">
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="text-center py-6 text-red-500">
        <p>Error loading availability data.</p>
        <p className="text-sm mt-2">
          {error instanceof Error ? error.message : 'Please try again later.'}
        </p>
      </div>
    );
  }
  
  if (requests.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <p>No availability preferences set.</p>
        <p className="text-sm mt-2">
          Set your preferred working hours to help your manager schedule shifts more effectively.
        </p>
      </div>
    );
  }
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Approved</Badge>;
      case 'Rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
    }
  };
  
  return (
    <div className="space-y-3 mt-2">
      {requests.map((request) => (
        <div key={request.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-medium">
                {format(new Date(request.date), 'EEEE, MMMM d, yyyy')}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                <Clock className="h-3.5 w-3.5 inline mr-1" />
                {request.start_time} - {request.end_time}
              </div>
              {request.notes && (
                <div className="text-sm text-gray-500 mt-1">
                  Note: {request.notes}
                </div>
              )}
            </div>
            <div className="flex flex-col items-end">
              {getStatusBadge(request.status)}
              <span className="text-sm mt-1">
                {request.is_available ? 'Available' : 'Unavailable'}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AvailabilityRequestList;
