
import React from 'react';
import { Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LeaveBalanceCardProps } from '@/types/leave';

const LeaveBalanceCard = ({ leaveBalance }: LeaveBalanceCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5" />
          Leave Balance
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Annual Leave</span>
            <span className="font-medium">{leaveBalance.annual} days</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Sick Leave</span>
            <span className="font-medium">{leaveBalance.sick} days</span>
          </div>
          
          {leaveBalance.personal !== undefined && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Personal Leave</span>
              <span className="font-medium">{leaveBalance.personal} days</span>
            </div>
          )}
          
          {leaveBalance.used !== undefined && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Used Leave</span>
              <span className="font-medium">{leaveBalance.used} days</span>
            </div>
          )}
          
          {leaveBalance.remaining !== undefined && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Remaining Leave</span>
              <span className="font-medium">{leaveBalance.remaining} days</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LeaveBalanceCard;
