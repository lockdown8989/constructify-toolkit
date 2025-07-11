
import React, { useState } from 'react';
import { Users, FolderOpen, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';

interface DashboardStatsSectionProps {
  employeeCount: number;
  hiredCount: number;
  isManager: boolean;
}

type StatType = 'active-employees' | 'todays-hours' | 'overtime' | 'alerts' | null;

const DashboardStatsSection: React.FC<DashboardStatsSectionProps> = ({ 
  employeeCount, 
  hiredCount,
  isManager 
}) => {
  const { stats, isLoading } = useDashboardStats();
  const [selectedStat, setSelectedStat] = useState<StatType>(null);

  const handleStatClick = (statType: StatType) => {
    setSelectedStat(statType);
  };

  const getModalContent = () => {
    switch (selectedStat) {
      case 'active-employees':
        return {
          title: 'Active Employees - Currently Clocked In',
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <h4 className="font-semibold text-sm text-gray-600">Currently Active</h4>
                  <p className="text-2xl font-bold text-green-600">{stats.activeEmployees}</p>
                  <p className="text-xs text-gray-500">Employees clocked in</p>
                </Card>
                <Card className="p-4">
                  <h4 className="font-semibold text-sm text-gray-600">Total Employees</h4>
                  <p className="text-2xl font-bold">{employeeCount}</p>
                  <p className="text-xs text-gray-500">In system</p>
                </Card>
              </div>
              <div className="text-sm text-gray-600">
                <p>• Real-time attendance tracking</p>
                <p>• Last updated: {format(new Date(), 'HH:mm:ss')}</p>
                <p>• Updates every 30 seconds</p>
              </div>
            </div>
          )
        };
      case 'todays-hours':
        return {
          title: "Today's Hours - Total Hours Worked",
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <h4 className="font-semibold text-sm text-gray-600">Hours Today</h4>
                  <p className="text-2xl font-bold text-blue-600">{stats.todaysHours.toFixed(1)}</p>
                  <p className="text-xs text-gray-500">Total hours worked</p>
                </Card>
                <Card className="p-4">
                  <h4 className="font-semibold text-sm text-gray-600">Average per Employee</h4>
                  <p className="text-2xl font-bold">{stats.activeEmployees > 0 ? (stats.todaysHours / stats.activeEmployees).toFixed(1) : '0'}</p>
                  <p className="text-xs text-gray-500">Hours per person</p>
                </Card>
              </div>
              <div className="text-sm text-gray-600">
                <p>• Calculated from clock-in/out records</p>
                <p>• Excludes break time</p>
                <p>• Updated in real-time</p>
              </div>
            </div>
          )
        };
      case 'overtime':
        return {
          title: 'Overtime - Hours This Week',
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <h4 className="font-semibold text-sm text-gray-600">This Week</h4>
                  <p className="text-2xl font-bold text-orange-600">{stats.overtimeHours.toFixed(1)}</p>
                  <p className="text-xs text-gray-500">Overtime hours</p>
                </Card>
                <Card className="p-4">
                  <h4 className="font-semibold text-sm text-gray-600">Overtime Cost</h4>
                  <p className="text-2xl font-bold">£{(stats.overtimeHours * 25).toFixed(0)}</p>
                  <p className="text-xs text-gray-500">Estimated (£25/hr)</p>
                </Card>
              </div>
              <div className="text-sm text-gray-600">
                <p>• Hours beyond standard 8-hour shifts</p>
                <p>• Week starts from Sunday</p>
                <p>• Requires approval for payment</p>
              </div>
            </div>
          )
        };
      case 'alerts':
        return {
          title: 'Alerts - Require Attention',
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <h4 className="font-semibold text-sm text-gray-600">Active Alerts</h4>
                  <p className="text-2xl font-bold text-red-600">{stats.alerts}</p>
                  <p className="text-xs text-gray-500">Need attention</p>
                </Card>
                <Card className="p-4">
                  <h4 className="font-semibold text-sm text-gray-600">Alert Types</h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>• Late arrivals</p>
                    <p>• Pending overtime</p>
                    <p>• Missing clock-outs</p>
                  </div>
                </Card>
              </div>
              <div className="text-sm text-gray-600">
                <p>• Check attendance records for details</p>
                <p>• Resolve by reviewing individual cases</p>
                <p>• Automated detection system</p>
              </div>
            </div>
          )
        };
      default:
        return { title: '', content: null };
    }
  };

  const modalData = getModalContent();

  return (
    <>
      <div className="flex flex-wrap -mx-2 mb-6">
        {/* Active Employees */}
        <div className="w-full sm:w-1/2 lg:w-1/4 px-2 mb-4">
          <StatCard 
            title="Active Employees" 
            value={isLoading ? "..." : stats.activeEmployees.toString()} 
            description="Currently clocked in"
            icon={<Users className="w-5 h-5" />}
            className="h-full cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleStatClick('active-employees')}
          />
        </div>

        {/* Today's Hours */}
        <div className="w-full sm:w-1/2 lg:w-1/4 px-2 mb-4">
          <StatCard 
            title="Today's Hours" 
            value={isLoading ? "..." : stats.todaysHours.toFixed(1)} 
            description="Total hours worked"
            icon={<Clock className="w-5 h-5" />}
            className="h-full cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleStatClick('todays-hours')}
          />
        </div>

        {/* Overtime */}
        <div className="w-full sm:w-1/2 lg:w-1/4 px-2 mb-4">
          <StatCard 
            title="Overtime" 
            value={isLoading ? "..." : stats.overtimeHours.toFixed(1)} 
            description="Hours this week"
            icon={<TrendingUp className="w-5 h-5" />}
            className="h-full cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleStatClick('overtime')}
          />
        </div>

        {/* Alerts */}
        <div className="w-full sm:w-1/2 lg:w-1/4 px-2 mb-4">
          <StatCard 
            title="Alerts" 
            value={isLoading ? "..." : stats.alerts.toString()} 
            description="Require attention"
            icon={<AlertTriangle className="w-5 h-5" />}
            className="h-full cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleStatClick('alerts')}
          />
        </div>

        {/* Additional Manager Stats */}
        {isManager && (
          <>
            <div className="w-full sm:w-1/2 lg:w-1/4 px-2 mb-4">
              <StatCard 
                title="Team Members" 
                value={employeeCount.toString()} 
                description="Total employees"
                icon={<Users className="w-5 h-5" />}
                className="h-full"
              />
            </div>
            <div className="w-full sm:w-1/2 lg:w-1/4 px-2 mb-4">
              <StatCard 
                title="Hirings" 
                value={hiredCount.toString()} 
                description="New hires"
                icon={<Users className="w-5 h-5" />}
                className="h-full"
              />
            </div>
            <div className="w-full sm:w-1/2 lg:w-1/4 px-2 mb-4">
              <StatCard 
                title="Projects" 
                value="185" 
                description="Active projects"
                icon={<FolderOpen className="w-5 h-5" />}
                className="h-full"
              />
            </div>
          </>
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={selectedStat !== null} onOpenChange={() => setSelectedStat(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{modalData.title}</DialogTitle>
          </DialogHeader>
          {modalData.content}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DashboardStatsSection;
