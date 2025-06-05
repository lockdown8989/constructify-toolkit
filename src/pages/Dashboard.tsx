
import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/auth';
import { useEmployees } from '@/hooks/use-employees';
import { useInterviews } from '@/hooks/use-interviews';
import { useAttendanceSync } from '@/hooks/use-attendance-sync';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import EmployeeDashboard from '@/components/dashboard/EmployeeDashboard';
import ManagerDashboard from '@/components/dashboard/ManagerDashboard';
import PayrollDashboard from '@/components/dashboard/PayrollDashboard';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const Dashboard = () => {
  const { isManager, isAdmin, isHR, isPayroll, isLoading: authLoading, user } = useAuth();
  const { data: employees = [], isLoading: isLoadingEmployees } = useEmployees();
  const { data: interviews = [], isLoading: isLoadingInterviews } = useInterviews();
  
  // Enable real-time sync at the dashboard level
  useAttendanceSync();

  // Get user's first name for greeting
  const firstName = user?.user_metadata?.first_name || 
                   user?.email?.split('@')[0] || 
                   'User';

  // Determine if the user has manager-level access (manager, admin, or HR, but not payroll)
  const hasManagerAccess = (isManager || isAdmin || isHR) && !isPayroll;
                   
  useEffect(() => {
    console.log("Dashboard user roles:", { isManager, isAdmin, isHR, isPayroll, hasManagerAccess });
    
    if (user && !authLoading) {
      // Log the current user information for debugging
      console.log("Current user:", user.id, user.email);
      console.log("User metadata:", user.user_metadata);
    }
  }, [user, isManager, isAdmin, isHR, isPayroll, authLoading, hasManagerAccess]);
  
  // Count employees excluding the manager themselves
  const employeeCount = hasManagerAccess || isPayroll
    ? employees.filter(emp => emp.user_id !== user?.id).length 
    : 1;
  
  // Get interview statistics - only show for managers and payroll
  const interviewStats = hasManagerAccess || isPayroll ? {
    interviews: interviews.filter(i => i.stage === 'Interview').reduce((acc, i) => acc + i.progress, 0) / 
                Math.max(interviews.filter(i => i.stage === 'Interview').length, 1),
    hired: interviews.filter(i => i.stage === 'Hired').reduce((acc, i) => acc + i.progress, 0) / 
           Math.max(interviews.filter(i => i.stage === 'Hired').length, 1),
    projectTime: 15, // Sample data, would come from project table
    output: 5 // Sample data, would come from project table
  } : {
    interviews: 0,
    hired: 0,
    projectTime: 0,
    output: 0
  };
  
  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="dashboard">
      <TabsContent value="dashboard" className="pt-20 md:pt-24 px-4 sm:px-6 pb-10 animate-fade-in">
        {isPayroll ? (
          <PayrollDashboard 
            firstName={firstName}
            employeeCount={employeeCount}
            hiredCount={interviews.filter(i => i.stage === 'Hired').length}
          />
        ) : hasManagerAccess ? (
          <ManagerDashboard 
            firstName={firstName}
            employeeCount={employeeCount}
            hiredCount={interviews.filter(i => i.stage === 'Hired').length}
            interviewStats={interviewStats}
          />
        ) : (
          <EmployeeDashboard firstName={firstName} />
        )}
      </TabsContent>
    </Tabs>
  );
};

export default Dashboard;
