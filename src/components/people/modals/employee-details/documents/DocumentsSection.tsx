
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import DocumentsTab from './DocumentsTab';
import AssignmentsTab from './AssignmentsTab';

interface DocumentsSectionProps {
  employeeId: string;
}

const DocumentsSection: React.FC<DocumentsSectionProps> = ({ employeeId }) => {
  const [activeTab, setActiveTab] = useState('documents');
  
  // Handle document assignment completion (will refresh both tabs)
  const handleAssignmentComplete = () => {
    console.log("Document assignment completed, refreshing data");
    // This will be passed to both tabs to trigger data refresh
  };
  
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
            onAssignmentComplete={handleAssignmentComplete}
          />
        </TabsContent>
        
        <TabsContent value="assignments" className="space-y-4">
          <AssignmentsTab 
            employeeId={employeeId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentsSection;
