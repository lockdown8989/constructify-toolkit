
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RequestForm from '@/components/workflow/RequestForm';
import RequestList from '@/components/workflow/RequestList';
import { useAuth } from '@/hooks/use-auth';
import { WorkflowProvider } from '@/providers/WorkflowProvider';

const WorkflowPage: React.FC = () => {
  return (
    <WorkflowProvider>
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Workflow Requests</h1>
        
        <Tabs defaultValue="my-requests" className="space-y-6">
          <TabsList>
            <TabsTrigger value="my-requests">My Requests</TabsTrigger>
            <TabsTrigger value="new-request">New Request</TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-requests">
            <RequestList />
          </TabsContent>
          
          <TabsContent value="new-request">
            <div className="max-w-lg mx-auto">
              <RequestForm />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </WorkflowProvider>
  );
};

export default WorkflowPage;
