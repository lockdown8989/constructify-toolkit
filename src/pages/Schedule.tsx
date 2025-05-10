
import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ShiftCalendar from '@/components/schedule/ShiftCalendar';
import { useIsMobile } from '@/hooks/use-mobile';

const Schedule = () => {
  const { user, isAdmin, isHR, isManager } = useAuth();
  const [activeTab, setActiveTab] = useState('calendar');
  const isMobile = useIsMobile();

  const hasManagerAccess = isAdmin || isHR || isManager;
  
  return (
    <div className="container py-6">
      <Tabs 
        defaultValue={activeTab} 
        onValueChange={setActiveTab} 
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          {hasManagerAccess && <TabsTrigger value="management">Management</TabsTrigger>}
          <TabsTrigger value="requests">Requests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar" className="mt-4">
          <div className={`bg-white rounded-lg shadow ${isMobile ? 'mx-[-0.5rem]' : ''}`}>
            <ShiftCalendar />
          </div>
        </TabsContent>
        
        {hasManagerAccess && (
          <TabsContent value="management" className="mt-4">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Schedule Management</h2>
              <p className="text-gray-600">
                Manage employee schedules, shifts, and time-off requests.
              </p>
            </div>
          </TabsContent>
        )}
        
        <TabsContent value="requests" className="mt-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Schedule Requests</h2>
            <p className="text-gray-600">
              View and manage your schedule requests and shift swaps.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Schedule;
