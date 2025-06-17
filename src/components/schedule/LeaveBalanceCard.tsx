
import React from 'react';
import { Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LeaveBalanceCardProps } from '@/types/leave';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

const LeaveBalanceCard = ({ leaveBalance }: LeaveBalanceCardProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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
  const totalAnnualLeave = 30; // Default total
  const annualLeaveRemaining = leaveBalance.annual || 20;
  const annualLeaveProgress = ((totalAnnualLeave - annualLeaveRemaining) / totalAnnualLeave) * 100;

  const totalSickLeave = 15; // Default total
  const sickLeaveRemaining = leaveBalance.sick || 10;
  const sickLeaveProgress = ((totalSickLeave - sickLeaveRemaining) / totalSickLeave) * 100;

  return (
    <Card className="bg-white rounded-2xl sm:rounded-3xl">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className={`flex items-center gap-2 font-medium ${isMobile ? 'text-lg' : 'text-xl'}`}>
          <Calendar className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'}`} />
          My Leave Balance
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4 sm:space-y-6">
        {/* Annual Leave Section */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex justify-between items-center">
            <span className={`font-medium text-gray-900 ${isMobile ? 'text-base' : 'text-lg'}`}>Annual Leave</span>
            <span className={`font-semibold ${isMobile ? 'text-base' : 'text-lg'}`}>{annualLeaveRemaining} / {totalAnnualLeave} days</span>
          </div>
          <Progress 
            value={annualLeaveProgress} 
            className={`bg-gray-200 rounded-full overflow-hidden ${isMobile ? 'h-3' : 'h-4'}`}
            indicatorClassName="bg-blue-500 transition-all duration-500"
          />
          <div className="text-xs sm:text-sm text-gray-600">
            Used: {totalAnnualLeave - annualLeaveRemaining} days
          </div>
        </div>

        {/* Sick Leave Section */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex justify-between items-center">
            <span className={`font-medium text-gray-900 ${isMobile ? 'text-base' : 'text-lg'}`}>Sick Leave</span>
            <span className={`font-semibold ${isMobile ? 'text-base' : 'text-lg'}`}>{sickLeaveRemaining} / {totalSickLeave} days</span>
          </div>
          <Progress 
            value={sickLeaveProgress} 
            className={`bg-gray-200 rounded-full overflow-hidden ${isMobile ? 'h-3' : 'h-4'}`}
            indicatorClassName="bg-green-500 transition-all duration-500"
          />
          <div className="text-xs sm:text-sm text-gray-600">
            Used: {totalSickLeave - sickLeaveRemaining} days
          </div>
        </div>

        {/* Request Leave Button */}
        <Button 
          onClick={handleRequestLeave}
          className={`w-full mt-4 sm:mt-6 bg-gray-900 hover:bg-gray-800 text-white rounded-xl sm:rounded-2xl font-medium ${
            isMobile ? 'py-2.5 text-base' : 'py-3 text-lg'
          }`}
        >
          Request Leave
        </Button>
      </CardContent>
    </Card>
  );
};

export default LeaveBalanceCard;
