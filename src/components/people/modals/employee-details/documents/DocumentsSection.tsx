
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import DocumentsTab from './DocumentsTab';
import AssignmentsTab from './AssignmentsTab';
import { useDocumentAssignments } from '@/hooks/use-document-assignments';

interface DocumentsSectionProps {
  employeeId: string;
}

const DocumentsSection: React.FC<DocumentsSectionProps> = ({ employeeId }) => {
  const [activeTab, setActiveTab] = useState('documents');
  
  const {
    data: assignmentsData,
    isLoading: isLoadingAssignments,
    refetch: refetchAssignments
  } = useDocumentAssignments(employeeId);
  
  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="documents" className="space-y-4">
          <DocumentsTab 
            employeeId={employeeId} 
            onAssignmentComplete={refetchAssignments} 
          />
        </TabsContent>
        
        <TabsContent value="assignments" className="space-y-4">
          <AssignmentsTab 
            employeeId={employeeId}
            assignmentsData={assignmentsData}
            isLoading={isLoadingAssignments}
            refetchAssignments={refetchAssignments}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentsSection;
