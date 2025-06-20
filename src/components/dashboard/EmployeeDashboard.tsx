
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import EmployeeAttendanceSummary from '@/components/dashboard/EmployeeAttendanceSummary';
import EmployeeStatistics from '@/components/people/EmployeeStatistics';
import DocumentList from '@/components/salary/components/DocumentList';
import PayslipList from '@/components/salary/components/PayslipList';
import { useEmployeeDataManagement } from '@/hooks/use-employee-data-management';
import { useAuth } from '@/hooks/auth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const EmployeeDashboard: React.FC<{ firstName: string }> = ({ firstName }) => {
  const { user } = useAuth();
  const { employeeId, isLoading, error } = useEmployeeDataManagement();
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string | null>(null);
  const [loadingEmployee, setLoadingEmployee] = useState(true);

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
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
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
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Hello {firstName}</h1>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded relative">
          <p className="text-sm sm:text-base">We're still setting up your employee profile. Some features might be limited.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6">Hello {firstName}</h1>
      
      {/* Mobile-first responsive grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Attendance Summary - Full width on mobile, spans 2 cols on xl */}
        <div className="lg:col-span-2 xl:col-span-2">
          <EmployeeAttendanceSummary employeeId={resolvedEmployeeId} />
        </div>
        
        {/* Statistics - Responsive positioning */}
        <div className="lg:col-span-2 xl:col-span-1">
          {resolvedEmployeeId && (
            <Card className="p-4 sm:p-6 h-full">
              <h3 className="text-xs font-semibold text-gray-500 mb-4 sm:mb-5 uppercase tracking-wider">
                Statistics
              </h3>
              <EmployeeStatistics employeeId={resolvedEmployeeId} />
            </Card>
          )}
        </div>
        
        {/* Payslips - Full width on mobile and tablet */}
        <div className="lg:col-span-2 xl:col-span-3">
          {resolvedEmployeeId && <PayslipList employeeId={resolvedEmployeeId} />}
        </div>
        
        {/* Documents - Full width */}
        <div className="lg:col-span-2 xl:col-span-3">
          {resolvedEmployeeId && (
            <Card className="p-4 sm:p-6">
              <h3 className="text-xs font-semibold text-gray-500 mb-4 sm:mb-5 uppercase tracking-wider">
                Documents
              </h3>
              <DocumentList employeeId={resolvedEmployeeId} />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
