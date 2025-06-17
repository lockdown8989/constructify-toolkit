
import React from 'react';
import EmployeeScheduleView from '@/components/schedule/EmployeeScheduleView';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

const ShiftCalendar = () => {
  const isMobile = useIsMobile();
  
  try {
    return (
      <div className="container mx-auto py-3 sm:py-6 px-2 sm:px-4 max-w-full">
        <div className="mb-4 sm:mb-6">
          <h1 className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-2xl'}`}>My Schedule</h1>
          <p className={`text-gray-600 mt-1 ${isMobile ? 'text-sm' : 'text-base'}`}>View and manage your work schedule</p>
        </div>
        <EmployeeScheduleView />
      </div>
    );
  } catch (error) {
    console.error('Error in ShiftCalendar component:', error);
    return (
      <div className="container mx-auto py-3 sm:py-6 px-2 sm:px-4 max-w-full">
        <Card className="p-4 sm:p-8 text-center">
          <div className="flex flex-col items-center gap-2">
            <AlertCircle className={`text-red-500 ${isMobile ? 'h-8 w-8' : 'h-10 w-10'}`} />
            <h3 className={`font-semibold mt-2 ${isMobile ? 'text-base' : 'text-lg'}`}>Error Loading Schedule</h3>
            <p className={`text-gray-600 max-w-md mx-auto mb-4 ${isMobile ? 'text-sm' : 'text-base'}`}>
              There was an error loading your schedule. Please try refreshing the page.
            </p>
            <Button variant="default" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        </Card>
      </div>
    );
  }
};

export default ShiftCalendar;
