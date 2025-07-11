
import React, { useState } from 'react';
import { Users, FolderOpen, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

  // Fetch detailed alerts when modal is open
  const { data: alertDetails, isLoading: alertsLoading } = useQuery({
    queryKey: ['alert-details'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      try {
        // Get attendance issues with proper join
        const { data: attendanceIssues, error } = await supabase
          .from('attendance')
          .select(`
            id,
            employee_id,
            date,
            is_late,
            late_minutes,
            overtime_minutes,
            overtime_status,
            attendance_status,
            check_in,
            check_out,
            current_status,
            employees (
              name
            )
          `)
          .eq('date', today)
          .or('is_late.eq.true,overtime_status.eq.pending,attendance_status.eq.Pending,check_out.is.null');

        if (error) {
          console.error('Error fetching alert details:', error);
          return [];
        }

        console.log('Alert details fetched:', attendanceIssues);
        return attendanceIssues || [];
      } catch (error) {
        console.error('Error in alert details query:', error);
        return [];
      }
    },
    enabled: selectedStat === 'alerts',
  });

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
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <h4 className="font-semibold text-sm text-gray-600">Active Alerts</h4>
                  <p className="text-2xl font-bold text-red-600">{stats.alerts}</p>
                  <p className="text-xs text-gray-500">Need attention</p>
                </Card>
                <Card className="p-4">
                  <h4 className="font-semibold text-sm text-gray-600">Last Updated</h4>
                  <p className="text-sm font-semibold">{format(new Date(), 'HH:mm:ss')}</p>
                  <p className="text-xs text-gray-500">Real-time data</p>
                </Card>
              </div>
              {alertsLoading ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">Loading alert details...</p>
                </div>
              ) : alertDetails && alertDetails.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-gray-700">Alert Details:</h4>
                  {alertDetails.map((alert: any) => (
                    <Card key={alert.id} className="p-3 border-l-4 border-l-red-500">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h5 className="font-medium text-sm">{alert.employees?.name || 'Unknown Employee'}</h5>
                          <div className="flex gap-2 flex-wrap">
                            {alert.is_late && (
                              <Badge variant="destructive" className="text-xs">
                                Late by {alert.late_minutes} min
                              </Badge>
                            )}
                            {alert.overtime_status === 'pending' && (
                              <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">
                                Overtime Pending
                              </Badge>
                            )}
                            {alert.attendance_status === 'Pending' && (
                              <Badge variant="secondary" className="text-xs">
                                Attendance Pending
                              </Badge>
                            )}
                            {alert.check_in && !alert.check_out && (
                              <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">
                                Not Clocked Out
                              </Badge>
                            )}
                            {alert.current_status === 'on-break' && (
                              <Badge variant="outline" className="text-xs border-blue-500 text-blue-600">
                                On Break
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            {alert.check_in && `Clocked in: ${format(new Date(alert.check_in), 'HH:mm')}`}
                            {alert.overtime_minutes > 0 && ` • Overtime: ${alert.overtime_minutes} min`}
                            {alert.current_status && ` • Status: ${alert.current_status}`}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {format(new Date(alert.date), 'MMM dd')}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">
                    {alertsLoading ? 'Loading...' : 'No specific alert details available'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {alertsLoading ? 'Fetching alert data...' : 'Alerts may include late arrivals, pending approvals, or missing records'}
                  </p>
                </div>
              )}
              
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                <p className="font-medium">Alert Types:</p>
                <ul className="text-xs space-y-1 mt-1">
                  <li>• Late arrivals (beyond grace period)</li>
                  <li>• Pending overtime approvals</li>
                  <li>• Missing clock-out records</li>
                  <li>• Attendance status requiring review</li>
                </ul>
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
