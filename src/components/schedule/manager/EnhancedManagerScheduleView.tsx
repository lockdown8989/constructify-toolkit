
import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Clock, Settings, Eye, Send, Plus } from 'lucide-react';
import ScheduleCalendarView from '../ScheduleCalendarView';
import ManagerScheduleControls from './ManagerScheduleControls';
import OpenShiftManager from './OpenShiftManager';
import { useSchedules } from '@/hooks/use-schedules';
import { useEmployees } from '@/hooks/use-employees';
import { useToast } from '@/hooks/use-toast';

const EnhancedManagerScheduleView: React.FC = () => {
  const { isAdmin, isManager, isHR } = useAuth();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isOpenShiftManagerOpen, setIsOpenShiftManagerOpen] = useState(false);
  const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false);

  const hasManagerAccess = isAdmin || isManager || isHR;
  const { data: schedules = [], isLoading: schedulesLoading } = useSchedules();
  const { data: employees = [] } = useEmployees();

  // Create employee names lookup
  const employeeNames = employees.reduce((acc, emp) => {
    acc[emp.id] = emp.name;
    return acc;
  }, {} as Record<string, string>);

  const handleCreateShift = () => {
    setIsAddScheduleOpen(true);
  };

  const handlePublishSchedule = () => {
    toast({
      title: "Publishing Schedule",
      description: "Sending notifications to all employees...",
    });
    // Implement publish logic
  };

  const handleCreateTemplate = () => {
    toast({
      title: "Template Feature",
      description: "Template creation will be available soon.",
    });
  };

  const handleManageOpenShifts = () => {
    setIsOpenShiftManagerOpen(true);
  };

  const handleCreateOpenShift = () => {
    toast({
      title: "Create Open Shift",
      description: "Open shift creation dialog will open here.",
    });
  };

  const handlePublishShift = (shiftId: string) => {
    toast({
      title: "Shift Published",
      description: "Open shift has been published to employees.",
    });
  };

  const handleAssignShift = (shiftId: string) => {
    toast({
      title: "View Applications",
      description: "Showing shift applications...",
    });
  };

  if (!hasManagerAccess) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Access denied. Manager permissions required.</p>
      </div>
    );
  }

  return (
    <div className={`${isMobile ? 'px-4 py-2' : 'container py-6'}`}>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Schedule Management</h1>
        <p className="mt-2 text-muted-foreground">
          Manage employee schedules, open shifts, and workforce planning
        </p>
      </div>

      <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-4'}`}>
        {/* Schedule Calendar - Takes most space on desktop */}
        <div className={isMobile ? 'order-2' : 'lg:col-span-3'}>
          <ScheduleCalendarView
            date={date}
            setDate={setDate}
            schedules={schedules}
            schedulesLoading={schedulesLoading}
            employeeNames={employeeNames}
            onAddSchedule={() => setIsAddScheduleOpen(true)}
            isAdmin={isAdmin}
            isHR={isHR}
          />
        </div>

        {/* Manager Controls Sidebar */}
        <div className={isMobile ? 'order-1' : 'lg:col-span-1'}>
          <ManagerScheduleControls
            onCreateShift={handleCreateShift}
            onPublishSchedule={handlePublishSchedule}
            onCreateTemplate={handleCreateTemplate}
            onManageOpenShifts={handleManageOpenShifts}
            openShiftsCount={6}
            unpublishedCount={3}
          />
        </div>
      </div>

      {/* Open Shift Manager Dialog */}
      <OpenShiftManager
        isOpen={isOpenShiftManagerOpen}
        onClose={() => setIsOpenShiftManagerOpen(false)}
        onCreateOpenShift={handleCreateOpenShift}
        onPublishShift={handlePublishShift}
        onAssignShift={handleAssignShift}
      />
    </div>
  );
};

export default EnhancedManagerScheduleView;
