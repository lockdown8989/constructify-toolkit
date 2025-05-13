
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { File, FileText } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { DocumentAssignment, useUpdateDocumentAssignment } from '@/hooks/use-document-assignments';
import { useToast } from '@/hooks/use-toast';

interface AssignmentsListProps {
  assignments: DocumentAssignment[];
  employeeId: string;
  onStatusUpdate: () => void;
}

const AssignmentsList: React.FC<AssignmentsListProps> = ({ 
  assignments, 
  employeeId, 
  onStatusUpdate 
}) => {
  const { toast } = useToast();
  const { mutateAsync: updateAssignmentStatus } = useUpdateDocumentAssignment();
  
  const handleUpdateStatus = async (assignmentId: string, status: 'pending' | 'viewed' | 'completed' | 'overdue') => {
    try {
      await updateAssignmentStatus({
        id: assignmentId,
        status
      });
      
      toast({
        title: "Status updated",
        description: `Assignment status updated to ${status}.`,
      });
      
      onStatusUpdate();
    } catch (error) {
      console.error('Status update error:', error);
      toast({
        title: "Status update failed",
        description: "There was an error updating the assignment status.",
        variant: "destructive"
      });
    }
  };
  
  const getDocumentIcon = (docType: string | undefined) => {
    if (!docType) return <File className="h-5 w-5 text-gray-500" />;
    
    const lowercaseType = docType.toLowerCase();
    
    if (lowercaseType.includes('pdf')) {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else if (lowercaseType.includes('word') || lowercaseType.includes('doc')) {
      return <FileText className="h-5 w-5 text-blue-500" />;
    } else if (lowercaseType.includes('excel') || lowercaseType.includes('xls')) {
      return <FileText className="h-5 w-5 text-green-500" />;
    } else {
      return <File className="h-5 w-5 text-gray-500" />;
    }
  };
  
  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Document</TableHead>
            <TableHead>Assigned Date</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignments.map((assignment) => (
            <TableRow key={assignment.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  {assignment.document && 
                    getDocumentIcon(assignment.document.document_type)}
                  <span>
                    {assignment.document 
                      ? assignment.document.name 
                      : 'Unknown document'}
                  </span>
                  {assignment.is_required && (
                    <Badge variant="outline" className="ml-2">Required</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(assignment.assigned_at), 'MMM d, yyyy')}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {assignment.due_date ? format(new Date(assignment.due_date), 'MMM d, yyyy') : '-'}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    assignment.status === 'completed' ? 'default' :
                    assignment.status === 'overdue' ? 'destructive' :
                    assignment.status === 'viewed' ? 'secondary' :
                    'outline'
                  }
                >
                  {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end">
                  <Select 
                    value={assignment.status}
                    onValueChange={(value) => handleUpdateStatus(assignment.id, value as any)}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Change status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="viewed">Viewed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

// Create a skeleton loader component for the assignment list
AssignmentsList.Skeleton = function AssignmentsListSkeleton() {
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

export default AssignmentsList;
