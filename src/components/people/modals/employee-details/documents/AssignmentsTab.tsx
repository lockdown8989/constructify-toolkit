
import React from 'react';
import { useDocumentAssignments } from '@/hooks/use-document-assignments';
import AssignmentsList from './AssignmentsList';
import AssignDocumentDialog from './AssignDocumentDialog';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AssignmentsTabProps {
  employeeId: string;
}

const AssignmentsTab: React.FC<AssignmentsTabProps> = ({ employeeId }) => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const { toast } = useToast();
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useDocumentAssignments(employeeId);
  
  const assignments = data || [];

  const handleAssignDocument = () => {
    refetch();
    toast({
      title: "Document assigned successfully",
      description: "The document has been assigned to the employee.",
    });
    setDialogOpen(false);
  };

  if (error) {
    return (
      <div className="text-center py-4 text-red-500">
        Failed to load document assignments
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Document Assignments</h3>
        <Button 
          size="sm" 
          onClick={() => setDialogOpen(true)}
          className="flex items-center gap-1"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Assign Document</span>
        </Button>
      </div>
      
      {isLoading ? (
        <AssignmentsList.Skeleton />
      ) : assignments && assignments.length > 0 ? (
        <AssignmentsList 
          assignments={assignments} 
          employeeId={employeeId}
          onStatusUpdate={refetch}
        />
      ) : (
        <p className="text-center py-4 text-muted-foreground">
          No documents assigned to this employee
        </p>
      )}

      <AssignDocumentDialog
        employeeId={employeeId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleAssignDocument}
      />
    </div>
  );
};

export default AssignmentsTab;
