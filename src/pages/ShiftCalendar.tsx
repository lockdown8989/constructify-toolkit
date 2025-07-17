
import React from 'react';
import ShiftCalendarComponent from '@/components/schedule/ShiftCalendar';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ShiftCalendar = () => {
  try {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Shift Calendar</h1>
          <p className="text-gray-600 mt-1">Manage shifts and schedules</p>
        </div>
        <ShiftCalendarComponent />
      </div>
    );
  } catch (error) {
    console.error('Error in ShiftCalendar component:', error);
    return (
      <div className="container mx-auto py-6">
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center gap-2">
            <AlertCircle className="h-10 w-10 text-red-500" />
            <h3 className="text-lg font-semibold mt-2">Error Loading Calendar</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-4">
              There was an error loading the shift calendar. Please try refreshing the page.
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
