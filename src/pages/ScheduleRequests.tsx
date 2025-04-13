
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useMediaQuery } from '@/hooks/use-media-query';
import ScheduleRequestsTab from '@/components/leave/tabs/ScheduleRequestsTab';

const ScheduleRequests = () => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  
  return (
    <div className="container py-4 sm:py-6">
      <Helmet>
        <title>Schedule Requests | HR Management</title>
      </Helmet>
      
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Schedule Requests</h1>
        <p className="mt-2 text-muted-foreground">
          Manage shift swaps and availability preferences for scheduling
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <ScheduleRequestsTab />
      </div>
    </div>
  );
};

export default ScheduleRequests;
