
import React, { useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useEmployees } from '@/hooks/use-employees';
import { useInterviews } from '@/hooks/use-interviews';
import { useAttendanceSync } from '@/hooks/use-attendance-sync';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import EmployeeDashboard from '@/components/dashboard/EmployeeDashboard';
import ManagerDashboard from '@/components/dashboard/ManagerDashboard';
import PayrollDashboard from '@/components/dashboard/PayrollDashboard';
import DashboardErrorBoundary from '@/components/dashboard/ErrorBoundary';
import { Loader2 } from 'lucide-react';
import { useMobileDebugger } from '@/hooks/useMobileDebugger';
import { useIsMobile } from '@/hooks/use-mobile';
import { debug } from '@/utils/debug';
import { usePerformance } from '@/hooks/use-performance';

const Dashboard = React.memo(() => {
  const { isManager, isAdmin, isHR, isPayroll, isEmployee, isLoading: authLoading, user, rolesLoaded } = useAuth();
  const { data: employees = [], isLoading: isLoadingEmployees } = useEmployees();
  const { data: interviews = [], isLoading: isLoadingInterviews } = useInterviews();
  const isMobile = useIsMobile();
  const { measureOperation } = usePerformance('Dashboard');
  
  // Enable real-time sync at the dashboard level
  useAttendanceSync();
  
  // Enable mobile debugging
  useMobileDebugger();

  // Memoized first name calculation
  const firstName = useMemo(() => {
    return user?.user_metadata?.first_name || 
           user?.email?.split('@')[0] || 
           'User';
  }, [user?.user_metadata?.first_name, user?.email]);

  // Memoized dashboard type calculation
  const dashboardType = useMemo(() => {
    const operation = measureOperation('dashboard-type-calculation');
    operation.start();
    
    debug.performance('Dashboard role determination', { 
      isManager, 
      isAdmin, 
      isHR, 
      isPayroll, 
      isEmployee,
      userEmail: user?.email,
      rolesLoaded,
      isMobile
    });
    
    const type = (isAdmin || isHR || isManager) ? 'manager' : 
                 isPayroll ? 'payroll' : 'employee';
    
    operation.end();
    return type;
  }, [isManager, isAdmin, isHR, isPayroll, isEmployee, user?.email, rolesLoaded, isMobile, measureOperation]);
                   
  useEffect(() => {
    debug.performance('Dashboard role state', { 
      isManager, 
      isAdmin, 
      isHR, 
      isPayroll, 
      isEmployee,
      rolesLoaded,
      dashboardType,
      userId: user?.id,
      userEmail: user?.email,
      isMobile,
      screenSize: isMobile ? `${window.innerWidth}x${window.innerHeight}` : 'desktop'
    });
    
    if (user && rolesLoaded) {
      debug.performance(`Dashboard will show: ${dashboardType} dashboard for user: ${user.email} ${isMobile ? '(mobile)' : '(desktop)'}`);
    }
  }, [user, isManager, isAdmin, isHR, isPayroll, isEmployee, rolesLoaded, dashboardType, isMobile]);
  
  // Show loading state while auth is loading or roles are loading
  if (authLoading || !rolesLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
          {isMobile && (
            <p className="text-xs text-gray-400 mt-2">Mobile view</p>
          )}
        </div>
      </div>
    );
  }

  // Memoized employee count calculation
  const employeeCount = useMemo(() => {
    return (dashboardType === 'manager' || dashboardType === 'payroll')
      ? employees.filter(emp => emp.user_id !== user?.id).length 
      : 1;
  }, [dashboardType, employees, user?.id]);
  
  // Memoized interview statistics calculation
  const interviewStats = useMemo(() => {
    if (dashboardType !== 'manager' && dashboardType !== 'payroll') {
      return { interviews: 0, hired: 0, projectTime: 0, output: 0 };
    }
    
    const interviewList = interviews.filter(i => i.stage === 'Interview');
    const hiredList = interviews.filter(i => i.stage === 'Hired');
    
    return {
      interviews: interviewList.reduce((acc, i) => acc + i.progress, 0) / Math.max(interviewList.length, 1),
      hired: hiredList.reduce((acc, i) => acc + i.progress, 0) / Math.max(hiredList.length, 1),
      projectTime: 15,
      output: 5
    };
  }, [dashboardType, interviews]);

  debug.performance(`Final dashboard type decision: ${dashboardType} ${isMobile ? '(mobile)' : '(desktop)'}`);

  return (
    <DashboardErrorBoundary>
      <Tabs defaultValue="dashboard">
        <TabsContent value="dashboard" className="pt-20 md:pt-24 px-4 sm:px-6 pb-10 animate-fade-in">
          <DashboardErrorBoundary>
            {dashboardType === 'payroll' ? (
              <PayrollDashboard 
                firstName={firstName}
                employeeCount={employeeCount}
                hiredCount={interviews.filter(i => i.stage === 'Hired').length}
              />
            ) : dashboardType === 'manager' ? (
              <ManagerDashboard 
                firstName={firstName}
                employeeCount={employeeCount}
                hiredCount={interviews.filter(i => i.stage === 'Hired').length}
                interviewStats={interviewStats}
              />
            ) : (
              <EmployeeDashboard firstName={firstName} />
            )}
          </DashboardErrorBoundary>
        </TabsContent>
      </Tabs>
    </DashboardErrorBoundary>
  );
});

Dashboard.displayName = 'Dashboard';

export default Dashboard;
