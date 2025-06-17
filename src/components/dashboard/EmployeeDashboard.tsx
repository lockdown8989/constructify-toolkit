
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import EmployeeAttendanceSummary from '@/components/dashboard/EmployeeAttendanceSummary';
import DocumentList from '@/components/salary/components/DocumentList';
import PayslipList from '@/components/salary/components/PayslipList';
import LeaveBalanceCard from '@/components/schedule/LeaveBalanceCard';
import { useEmployeeDataManagement } from '@/hooks/use-employee-data-management';
import { useEmployeeLeave } from '@/hooks/use-employee-leave';
import { useAuth } from '@/hooks/auth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const EmployeeDashboard: React.FC<{ firstName: string }> = ({ firstName }) => {
  const { user } = useAuth();
  const { employeeId, isLoading, error } = useEmployeeDataManagement();
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string | null>(null);
  const [loadingEmployee, setLoadingEmployee] = useState(true);

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
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-2xl font-bold mb-6">Hello {firstName}</h1>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="ml-2">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !resolvedEmployeeId) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-2xl font-bold mb-6">Hello {firstName}</h1>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded relative">
          <p>We're still setting up your employee profile. Some features might be limited.</p>
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
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">Hello {firstName}</h1>
      <div className="grid gap-6">
        <EmployeeAttendanceSummary employeeId={resolvedEmployeeId} />
        
        {/* Leave Balance Card with live data */}
        <LeaveBalanceCard leaveBalance={leaveBalance} />
        
        {resolvedEmployeeId && (
          <>
            {/* Add Payslip List component */}
            <PayslipList employeeId={resolvedEmployeeId} />
            
            <Card className="p-6">
              <h3 className="text-xs font-semibold text-gray-500 mb-5 uppercase tracking-wider">
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
