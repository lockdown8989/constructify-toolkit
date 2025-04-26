
import React from 'react';
import { Card } from '@/components/ui/card';
import { useTimeClock } from '@/hooks/time-clock';
import { Clock, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAttendance } from '@/hooks/use-attendance';
import { formatDuration } from '@/utils/time-utils';
import { useEmployeeDataManagement } from '@/hooks/use-employee-data-management';

const EmployeeTimeClock = () => {
  const {
    status,
    handleClockIn,
    handleClockOut,
    handleBreakStart,
    handleBreakEnd,
    elapsedTime,
    breakTime
  } = useTimeClock();
  
  const { employeeData } = useEmployeeDataManagement();
  const { data: attendanceData } = useAttendance(employeeData?.id);

  return (
    <Card className="p-6 bg-white shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Time Clock</h2>
          <p className="text-gray-500">
            {status === 'clocked-in' && 'Currently working'}
            {status === 'on-break' && 'On break'}
            {status === 'clocked-out' && 'Not clocked in'}
          </p>
        </div>
        <Clock className="h-6 w-6 text-gray-400" />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <TimeStatCard
          title="Day offs"
          value={attendanceData?.absent || 0}
          trend={0}
          trendText="vs last month"
        />
        <TimeStatCard
          title="Late clock-ins"
          value={attendanceData?.late || 0}
          trend={-2}
          trendText="vs last month"
        />
        <TimeStatCard
          title="Total hours"
          value={Math.floor(elapsedTime / 3600)}
          trend={1}
          trendText="vs yesterday"
        />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center py-2">
          <div>
            <p className="text-sm text-gray-500">Current session</p>
            <p className="text-lg font-semibold">{formatDuration(elapsedTime)}</p>
          </div>
          {breakTime > 0 && (
            <div className="text-right">
              <p className="text-sm text-gray-500">Break time</p>
              <p className="text-lg font-semibold">{formatDuration(breakTime)}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          {status === 'clocked-out' ? (
            <Button 
              className="flex-1 bg-blue-500 hover:bg-blue-600" 
              onClick={() => handleClockIn(employeeData?.id)}
            >
              <Clock className="w-4 h-4 mr-2" />
              Clock In
            </Button>
          ) : (
            <>
              {status === 'clocked-in' && (
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={handleBreakStart}
                >
                  <Timer className="w-4 h-4 mr-2" />
                  Start Break
                </Button>
              )}
              {status === 'on-break' && (
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={handleBreakEnd}
                >
                  <Timer className="w-4 h-4 mr-2" />
                  End Break
                </Button>
              )}
              <Button 
                variant="destructive" 
                className="flex-1"
                onClick={handleClockOut}
              >
                <Clock className="w-4 h-4 mr-2" />
                Clock Out
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

const TimeStatCard = ({ title, value, trend, trendText }: {
  title: string;
  value: number;
  trend: number;
  trendText: string;
}) => (
  <div className="bg-gray-50 p-3 rounded-lg">
    <h3 className="text-sm text-gray-600 mb-1">{title}</h3>
    <p className="text-xl font-semibold mb-1">{value}</p>
    <p className={`text-xs ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'}`}>
      {trend > 0 ? '+' : ''}{trend} {trendText}
    </p>
  </div>
);

export default EmployeeTimeClock;
