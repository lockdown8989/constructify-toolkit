
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { DocumentAssignment } from '@/hooks/use-document-assignments';
import AssignmentsList from './AssignmentsList';

interface AssignmentsTabProps {
  employeeId: string;
  assignmentsData: any;
  isLoading: boolean;
  refetchAssignments: () => void;
}

const AssignmentsTab: React.FC<AssignmentsTabProps> = ({ 
  employeeId, 
  assignmentsData, 
  isLoading, 
  refetchAssignments 
}) => {
  // Properly type the assignments data
  const assignments: DocumentAssignment[] = Array.isArray(assignmentsData) 
    ? assignmentsData.map(item => ({
        ...item,
        document: item.document && typeof item.document === 'object' && !Array.isArray(item.document) 
          ? item.document 
          : null
      }))
    : [];
  
  return (
    <Card className="border-none">
      <CardContent className="p-0">
        <h3 className="text-sm font-medium mb-4">Document Assignments</h3>
        
        {isLoading ? (
          <AssignmentsList.Skeleton />
        ) : assignments.length > 0 ? (
          <AssignmentsList 
            assignments={assignments} 
            employeeId={employeeId} 
            onStatusUpdate={refetchAssignments}
          />
        ) : (
          <div className="text-center py-6">
            <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No document assignments</p>
            <p className="text-sm text-muted-foreground">
              Assign documents to this employee from the Documents tab
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AssignmentsTab;
