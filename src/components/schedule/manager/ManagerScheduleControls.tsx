
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Users, 
  Clock, 
  Settings, 
  Eye, 
  Send
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface ManagerScheduleControlsProps {
  onCreateShift: () => void;
  onPublishSchedule: () => void;
  onCreateTemplate: () => void;
  onManageOpenShifts: () => void;
  openShiftsCount: number;
  unpublishedCount: number;
}

const ManagerScheduleControls: React.FC<ManagerScheduleControlsProps> = ({
  onCreateShift,
  onPublishSchedule,
  onCreateTemplate,
  onManageOpenShifts,
  openShiftsCount,
  unpublishedCount
}) => {
  const { isAdmin, isManager, isHR } = useAuth();
  const hasManagerAccess = isAdmin || isManager || isHR;

  if (!hasManagerAccess) return null;

  return (
    <div className="space-y-4">
      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Schedule Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={onManageOpenShifts} 
              variant="outline" 
              className="w-full relative"
            >
              <Eye className="h-4 w-4 mr-2" />
              Open Shifts
              {openShiftsCount > 0 && (
                <Badge variant="destructive" className="ml-2 text-xs">
                  {openShiftsCount}
                </Badge>
              )}
            </Button>
            <Button 
              onClick={onPublishSchedule} 
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Send className="h-4 w-4 mr-2" />
              Publish
              {unpublishedCount > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs bg-white text-green-700">
                  {unpublishedCount}
                </Badge>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            This Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">24</div>
              <div className="text-xs text-gray-500">Total Shifts</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">18</div>
              <div className="text-xs text-gray-500">Filled</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">6</div>
              <div className="text-xs text-gray-500">Open</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Labor Hours */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Labor Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Scheduled</span>
              <span className="font-medium">192h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Overtime</span>
              <span className="font-medium text-orange-600">8h</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-sm font-medium">Labor Cost</span>
              <span className="font-bold">£4,800</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerScheduleControls;
