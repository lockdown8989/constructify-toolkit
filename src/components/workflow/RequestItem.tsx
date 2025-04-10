
import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WorkflowRequest } from '@/types/supabase';
import { useWorkflowRequests } from '@/hooks/workflow/useWorkflowRequests';
import { useAuth } from '@/hooks/use-auth';

interface RequestItemProps {
  request: WorkflowRequest;
  showActions?: boolean;
}

const RequestItem: React.FC<RequestItemProps> = ({ 
  request, 
  showActions = false 
}) => {
  const { isManager, isAdmin, isHR } = useAuth();
  const { updateRequestStatus } = useWorkflowRequests();
  const hasManagerAccess = isManager || isAdmin || isHR;
  
  const formattedDate = request.submitted_at 
    ? format(new Date(request.submitted_at), 'MMM d, yyyy h:mm a')
    : '';

  const getStatusBadge = () => {
    switch (request.status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Rejected</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-500">Pending</Badge>;
    }
  };

  const handleApprove = () => {
    updateRequestStatus({ id: request.id, status: 'approved' });
  };

  const handleReject = () => {
    updateRequestStatus({ id: request.id, status: 'rejected' });
  };

  // Format JSON details for display
  const formatDetails = () => {
    if (!request.details) return 'No details';
    
    try {
      const details = typeof request.details === 'string' 
        ? JSON.parse(request.details) 
        : request.details;
      
      return Object.entries(details).map(([key, value]) => (
        <div key={key} className="flex">
          <span className="font-medium mr-2">{key}:</span>
          <span>{String(value)}</span>
        </div>
      ));
    } catch (error) {
      return String(request.details);
    }
  };

  return (
    <Card className={cn(
      "mb-4", 
      request.status === 'pending' ? "border-yellow-300" : 
      request.status === 'approved' ? "border-green-300" : 
      "border-red-300"
    )}>
      <CardContent className="pt-6">
        <div className="flex justify-between mb-4">
          <div>
            <h3 className="font-medium text-lg capitalize">
              {request.request_type.replace(/-/g, ' ')}
            </h3>
            <p className="text-muted-foreground text-sm">
              Submitted on {formattedDate}
            </p>
          </div>
          {getStatusBadge()}
        </div>
        
        <div className="space-y-2 text-sm">
          {formatDetails()}
        </div>
      </CardContent>
      
      {showActions && hasManagerAccess && request.status === 'pending' && (
        <CardFooter className="flex justify-end space-x-2 pt-0">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
            onClick={handleReject}
          >
            <X className="h-4 w-4 mr-1" />
            Reject
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-green-500 border-green-200 hover:bg-green-50 hover:text-green-600"
            onClick={handleApprove}
          >
            <Check className="h-4 w-4 mr-1" />
            Approve
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default RequestItem;
