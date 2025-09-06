
import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useEmployees } from '@/hooks/use-employees';
import { useInterviews } from '@/hooks/use-interviews';
import { useAttendanceSync } from '@/hooks/use-attendance-sync';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import EmployeeDashboard from '@/components/dashboard/EmployeeDashboard';
import ManagerDashboard from '@/components/dashboard/ManagerDashboard';
import PayrollDashboard from '@/components/dashboard/PayrollDashboard';
import DashboardErrorBoundary from '@/components/dashboard/ErrorBoundary';
import SubscriptionGate from '@/components/subscription/SubscriptionGate';
import { Loader2 } from 'lucide-react';
import { useMobileDebugger } from '@/hooks/useMobileDebugger';
import { useIsMobile } from '@/hooks/use-mobile';
import { useRegistrationRecovery } from '@/hooks/useRegistrationRecovery';

const Dashboard = () => {
  const { isManager, isAdmin, isHR, isPayroll, isEmployee, isLoading: authLoading, user, rolesLoaded } = useAuth();
  const { data: employees = [], isLoading: isLoadingEmployees } = useEmployees();
  const { data: interviews = [], isLoading: isLoadingInterviews } = useInterviews();
  const isMobile = useIsMobile();
  
  // Enable real-time sync at the dashboard level
  useAttendanceSync();
  
  // Enable mobile debugging
  useMobileDebugger();

  // Enable registration recovery for incomplete accounts
  const { isRecovering } = useRegistrationRecovery();

  // Get user's first name for greeting
  const firstName = user?.user_metadata?.first_name || 
                   user?.email?.split('@')[0] || 
                   'User';

  // Determine dashboard type based on role priority - Enhanced for all account types
  const getDashboardType = () => {
    console.log("🎯 Dashboard role determination:", { 
      isManager, 
      isAdmin, 
      isHR, 
      isPayroll, 
      isEmployee,
      userEmail: user?.email,
      rolesLoaded,
      isMobile,
      userMetadata: user?.user_metadata
    });
    
    // Priority order based on registration account types:
    // 1. System Admin -> Manager Dashboard
    // 2. HR Administrator -> Manager Dashboard  
    // 3. Employer (Administrator) -> Manager Dashboard
    // 4. Manager -> Manager Dashboard
    // 5. Payroll Administrator -> Payroll Dashboard
    // 6. Employee -> Employee Dashboard
    if (isAdmin || isHR || isManager) {
      console.log("🎯 Routing to Manager Dashboard for:", { isAdmin, isHR, isManager });
      return 'manager';
    }
    if (isPayroll) {
      console.log("🎯 Routing to Payroll Dashboard");
      return 'payroll';
    }
    console.log("🎯 Routing to Employee Dashboard");
    return 'employee';
  };

  const dashboardType = getDashboardType();
                   
  useEffect(() => {
    console.log("📊 Dashboard role state:", { 
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
      console.log("🎯 Dashboard will show:", dashboardType, "dashboard", isMobile ? '(mobile)' : '(desktop)');
    }
  }, [user, isManager, isAdmin, isHR, isPayroll, isEmployee, rolesLoaded, dashboardType, isMobile]);
  
  // Enhanced loading state with role information
  if (authLoading || !rolesLoaded || !user || isRecovering) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="text-center max-w-md mx-auto">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-gray-600 text-sm sm:text-base">
            {!user ? 'Authenticating...' : 
             isRecovering ? 'Setting up your account profile...' :
             !rolesLoaded ? 'Loading your account permissions...' : 
             'Preparing your dashboard...'}
          </p>
          {isMobile && (
            <p className="text-xs text-gray-400 mt-2">Mobile view optimized</p>
          )}
          {user && !rolesLoaded && (
            <p className="text-xs text-gray-500 mt-2">
              Setting up {user.email?.split('@')[0] || 'your'} dashboard...
            </p>
          )}
        </div>
      </div>
    );
  }

  // Count employees excluding the manager themselves (for manager/payroll dashboards)
  const employeeCount = (dashboardType === 'manager' || dashboardType === 'payroll')
    ? employees.filter(emp => emp.user_id !== user?.id).length 
    : 1;
  
  // Get interview statistics for manager and payroll dashboards
  const interviewStats = (dashboardType === 'manager' || dashboardType === 'payroll') ? {
    interviews: interviews.filter(i => i.stage === 'Interview').reduce((acc, i) => acc + i.progress, 0) / 
                Math.max(interviews.filter(i => i.stage === 'Interview').length, 1),
    hired: interviews.filter(i => i.stage === 'Hired').reduce((acc, i) => acc + i.progress, 0) / 
           Math.max(interviews.filter(i => i.stage === 'Hired').length, 1),
    projectTime: 15,
    output: 5
  } : {
    interviews: 0,
    hired: 0,
    projectTime: 0,
    output: 0
  };

  console.log("🎯 Final dashboard type decision:", dashboardType, isMobile ? '(mobile)' : '(desktop)');
  console.log("🎯 Dashboard routing based on roles:", {
    selectedDashboard: dashboardType,
    accountType: isAdmin ? 'System Admin' : 
                 isHR ? 'HR Administrator' : 
                 isManager ? 'Manager/Employer' :
                 isPayroll ? 'Payroll Administrator' :
                 'Employee',
    isMobile
  });

  return (
    <SubscriptionGate>
      <DashboardErrorBoundary>
        <Tabs defaultValue="dashboard">
          <TabsContent value="dashboard" className={`pt-16 md:pt-20 ${isMobile ? 'px-2 pb-20' : 'px-4 sm:px-6 pb-10'} animate-fade-in`}>
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
    </SubscriptionGate>
  );
};

export default Dashboard;
