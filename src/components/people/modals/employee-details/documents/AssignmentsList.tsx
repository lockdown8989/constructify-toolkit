
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, FileClock, CheckCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { DocumentAssignment, useUpdateDocumentAssignment } from '@/hooks/use-document-assignments';
import { useToast } from '@/hooks/use-toast';

interface AssignmentsListProps {
  assignments: DocumentAssignment[];
  employeeId: string;
  onStatusUpdate: () => void;
}

// Define the Skeleton loader component for assignment list
const AssignmentsListSkeleton = () => {
  return (
    <div className="space-y-2">
      {Array(3).fill(0).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-3 w-[100px]" />
            </div>
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
      ))}
    </div>
  );
};

// Define the component with proper TypeScript type including Skeleton
const AssignmentsList: React.FC<AssignmentsListProps> & {
  Skeleton: React.FC;
} = ({ 
  assignments, 
  employeeId, 
  onStatusUpdate 
}) => {
  const { toast } = useToast();
  const updateAssignmentMutation = useUpdateDocumentAssignment();

  const handleStatusChange = async (
    assignmentId: string,
    newStatus: 'pending' | 'viewed' | 'completed' | 'overdue'
  ) => {
    try {
      await updateAssignmentMutation.mutateAsync({
        id: assignmentId,
        status: newStatus
      });
      
      toast({
        title: "Assignment status updated",
        description: `Assignment status updated to ${newStatus}`,
      });
      onStatusUpdate(); // Refresh assignments
    } catch (error: any) {
      toast({
        title: "Error updating assignment status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="divide-y divide-border">
      {assignments.map((assignment) => (
        <div key={assignment.id} className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            {assignment.document?.url ? (
              <a href={assignment.document.url} target="_blank" rel="noopener noreferrer">
                <FileText className="h-10 w-10 text-blue-500" />
              </a>
            ) : (
              <FileText className="h-10 w-10 text-gray-400" />
            )}
            <div>
              <h4 className="font-semibold">{assignment.document?.name || 'Unknown document'}</h4>
              <p className="text-sm text-muted-foreground">
                Assigned: {format(new Date(assignment.assigned_at), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {assignment.status === 'completed' ? (
              <Badge variant="outline" className="gap-1.5">
                <CheckCircle className="h-4 w-4" />
                Completed
              </Badge>
            ) : assignment.status === 'viewed' ? (
              <Badge variant="secondary" className="gap-1.5">
                <FileClock className="h-4 w-4" />
                Viewed
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1.5">
                <FileClock className="h-4 w-4" />
                Pending
              </Badge>
            )}
            <Select
              value={assignment.status}
              onValueChange={(value) => handleStatusChange(assignment.id, value as 'pending' | 'viewed' | 'completed' | 'overdue')}
              disabled={updateAssignmentMutation.isPending}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="viewed">Viewed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      ))}
    </div>
  );
};

// Attach Skeleton component as a static property
AssignmentsList.Skeleton = AssignmentsListSkeleton;

export default AssignmentsList;
