
import React from 'react';
import { Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useEmployeeLeave } from '@/hooks/use-employee-leave';
import { useNavigate } from 'react-router-dom';

const LeaveBalanceCard = () => {
  const { data: leaveData, isLoading } = useEmployeeLeave();
  const navigate = useNavigate();

  // Calculate percentages for progress bars
  const annualLeavePercentage = leaveData ? 
    (leaveData.annual_leave_days / (leaveData.totalAnnualLeave || 30)) * 100 : 0;
  
  const sickLeavePercentage = leaveData ? 
    (leaveData.sick_leave_days / (leaveData.totalSickLeave || 15)) * 100 : 0;

  const handleRequestLeave = () => {
    navigate('/leave', { state: { initialView: 'employee' } });
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-xl gap-2">
          <Calendar className="h-6 w-6" />
          My Leave Balance
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {isLoading ? (
          <p className="text-center text-muted-foreground">Loading leave balance...</p>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-lg">Annual Leave</span>
                <span className="text-lg font-medium">
                  {leaveData?.annual_leave_days || 0} / {leaveData?.totalAnnualLeave || 30} days
                </span>
              </div>
              <Progress value={annualLeavePercentage} className="h-2" indicatorClassName="bg-blue-500" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-lg">Sick Leave</span>
                <span className="text-lg font-medium">
                  {leaveData?.sick_leave_days || 0} / {leaveData?.totalSickLeave || 15} days
                </span>
              </div>
              <Progress value={sickLeavePercentage} className="h-2" indicatorClassName="bg-green-500" />
            </div>
            
            <Button 
              className="w-full py-6 text-lg mt-4" 
              onClick={handleRequestLeave}
            >
              Request Leave
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default LeaveBalanceCard;
