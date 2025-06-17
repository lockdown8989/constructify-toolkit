
import React from 'react';
import { Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LeaveBalanceCardProps } from '@/types/leave';
import { useNavigate } from 'react-router-dom';

const LeaveBalanceCard = ({ leaveBalance }: LeaveBalanceCardProps) => {
  const navigate = useNavigate();

  const handleRequestLeave = () => {
    // Navigate to leave management with form view
    navigate('/leave-management', { 
      state: { 
        showLeaveRequestForm: true,
        initialView: 'employee'
      } 
    });
  };

  // Calculate progress percentages for visual representation
  const annualLeaveUsed = (leaveBalance.used || 0);
  const totalAnnualLeave = 30; // Default total
  const annualLeaveRemaining = leaveBalance.annual || 20;
  const annualLeaveProgress = ((totalAnnualLeave - annualLeaveRemaining) / totalAnnualLeave) * 100;

  const totalSickLeave = 15; // Default total
  const sickLeaveRemaining = leaveBalance.sick || 10;
  const sickLeaveProgress = ((totalSickLeave - sickLeaveRemaining) / totalSickLeave) * 100;

  return (
    <Card className="bg-white rounded-3xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl font-medium">
          <Calendar className="h-6 w-6" />
          My Leave Balance
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Annual Leave Section */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-gray-900">Annual Leave</span>
            <span className="text-lg font-semibold">{annualLeaveRemaining} / {totalAnnualLeave} days</span>
          </div>
          <Progress 
            value={annualLeaveProgress} 
            className="h-4 bg-gray-200 rounded-full overflow-hidden"
            indicatorClassName="bg-blue-500 transition-all duration-500"
          />
          <div className="text-sm text-gray-600">
            Used: {totalAnnualLeave - annualLeaveRemaining} days
          </div>
        </div>

        {/* Sick Leave Section */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-gray-900">Sick Leave</span>
            <span className="text-lg font-semibold">{sickLeaveRemaining} / {totalSickLeave} days</span>
          </div>
          <Progress 
            value={sickLeaveProgress} 
            className="h-4 bg-gray-200 rounded-full overflow-hidden"
            indicatorClassName="bg-green-500 transition-all duration-500"
          />
          <div className="text-sm text-gray-600">
            Used: {totalSickLeave - sickLeaveRemaining} days
          </div>
        </div>

        {/* Request Leave Button */}
        <Button 
          onClick={handleRequestLeave}
          className="w-full mt-6 bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-2xl text-lg font-medium"
        >
          Request Leave
        </Button>
      </CardContent>
    </Card>
  );
};

export default LeaveBalanceCard;
