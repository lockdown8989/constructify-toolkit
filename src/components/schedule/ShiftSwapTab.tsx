
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ShiftSwapForm from './ShiftSwapForm';
import ShiftSwapList from './ShiftSwapList';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

const ShiftSwapTab = () => {
  const [activeTab, setActiveTab] = useState('request');
  const { user, isManager } = useAuth();
  const { toast } = useToast();

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            Please sign in to access shift swap features
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="request">Request Swap</TabsTrigger>
          <TabsTrigger value="history">Swap History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="request" className="mt-4">
          <ShiftSwapForm />
        </TabsContent>
        
        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Shift Swap History</CardTitle>
            </CardHeader>
            <CardContent>
              <ShiftSwapList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ShiftSwapTab;
