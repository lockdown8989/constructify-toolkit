
import React from 'react';
import { Helmet } from 'react-helmet-async';
import ScheduleRequestsTab from '@/components/leave/tabs/ScheduleRequestsTab';
import { Card, CardContent } from '@/components/ui/card';

const ScheduleRequests = () => {
  return (
    <div className="container py-6">
      <Helmet>
        <title>Schedule Requests | HR Management</title>
      </Helmet>
      
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Schedule Requests</h1>
        <p className="mt-2 text-muted-foreground">
          Manage shift swaps and employee availability preferences
        </p>
      </div>
      
      <Card className="border-0 shadow-md rounded-xl overflow-hidden">
        <CardContent className="p-0">
          <ScheduleRequestsTab />
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleRequests;
