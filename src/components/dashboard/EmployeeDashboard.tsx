
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import EmployeeAttendanceSummary from '@/components/dashboard/EmployeeAttendanceSummary';
import DocumentList from '@/components/salary/components/DocumentList';
import PayslipList from '@/components/salary/components/PayslipList';
import LeaveBalanceCard from '@/components/schedule/LeaveBalanceCard';
import { useEmployeeDataManagement } from '@/hooks/use-employee-data-management';
import { useEmployeeLeave } from '@/hooks/use-employee-leave';
import { useAuth } from '@/hooks/auth';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const EmployeeDashboard: React.FC<{ firstName: string }> = ({ firstName }) => {
  const { user } = useAuth();
  const { employeeId, isLoading, error } = useEmployeeDataManagement();
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string | null>(null);
  const [loadingEmployee, setLoadingEmployee] = useState(true);
  const isMobile = useIsMobile();

  // Fetch employee leave data
  const { data: leaveData } = useEmployeeLeave(employeeId || currentEmployeeId || undefined);

  // Fetch employee record if not available through hook
  useEffect(() => {
    const fetchEmployeeRecord = async () => {
      if (!user || employeeId) {
        setLoadingEmployee(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('employees')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching employee record:", error);
        } else if (data) {
          setCurrentEmployeeId(data.id);
        }
      } catch (err) {
        console.error("Exception in fetchEmployeeRecord:", err);
      } finally {
        setLoadingEmployee(false);
      }
    };

    fetchEmployeeRecord();
  }, [user, employeeId]);

  // Use employeeId from hook if available, otherwise use the one we fetched
  const resolvedEmployeeId = employeeId || currentEmployeeId;

  if (isLoading || loadingEmployee) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-full sm:max-w-5xl">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Hello {firstName}</h1>
        <div className="flex justify-center items-center h-32 sm:h-64">
          <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin" />
          <p className="ml-2 text-sm sm:text-base">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !resolvedEmployeeId) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-full sm:max-w-5xl">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Hello {firstName}</h1>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 sm:px-4 py-3 rounded relative">
          <p className="text-sm sm:text-base">We're still setting up your employee profile. Some features might be limited.</p>
        </div>
      </div>
    );
  }

  // Transform leave data for LeaveBalanceCard
  const leaveBalance = {
    annual: leaveData?.annual_leave_days || 0,
    sick: leaveData?.sick_leave_days || 0
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-full sm:max-w-5xl">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Hello {firstName}</h1>
      <div className={`grid gap-3 sm:gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-1'}`}>
        <EmployeeAttendanceSummary employeeId={resolvedEmployeeId} />
        
        {/* Leave Balance Card with live data */}
        <LeaveBalanceCard leaveBalance={leaveBalance} />
        
        {resolvedEmployeeId && (
          <>
            {/* Add Payslip List component */}
            <PayslipList employeeId={resolvedEmployeeId} />
            
            <Card className="p-3 sm:p-6">
              <h3 className="text-xs font-semibold text-gray-500 mb-3 sm:mb-5 uppercase tracking-wider">
                Documents
              </h3>
              <DocumentList employeeId={resolvedEmployeeId} />
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
