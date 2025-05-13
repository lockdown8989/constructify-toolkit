
import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/auth';
import { useEmployees } from '@/hooks/use-employees';
import { useInterviews } from '@/hooks/use-interviews';
import { useAttendanceSync } from '@/hooks/use-attendance-sync';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import EmployeeDashboard from '@/components/dashboard/EmployeeDashboard';
import ManagerDashboard from '@/components/dashboard/ManagerDashboard';
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { isManager, user } = useAuth();
  const { data: employees = [], isLoading: isLoadingEmployees } = useEmployees();
  const { data: interviews = [], isLoading: isLoadingInterviews } = useInterviews();
  const { toast } = useToast();
  
  // Enable real-time sync at the dashboard level
  useAttendanceSync();

  useEffect(() => {
    console.log("Dashboard rendered with isManager:", isManager);
    console.log("User data:", user);
    console.log("Employees count:", employees.length);

    // For debugging - show role-based dashboard access
    if (isManager) {
      console.log("User has manager privileges - showing manager dashboard");
    } else {
      console.log("User does not have manager privileges - showing employee dashboard");
    }
  }, [isManager, user, employees]);

  // Get user's first name for greeting
  const firstName = user?.user_metadata?.first_name || 
                   user?.email?.split('@')[0] || 
                   'User';

  // Count employees excluding the manager themselves
  const employeeCount = isManager 
    ? employees.filter(emp => emp.user_id !== user?.id).length 
    : 1;
  
  // Transform employees data for the SalaryTable
  const salaryEmployees = employees.slice(0, 3).map(emp => ({
    id: emp.id,
    name: emp.name,
    avatar: emp.avatar || `https://randomuser.me/api/portraits//${Math.random() > 0.5 ? 'women' : 'men'}/${Math.floor(Math.random() * 99)}.jpg`,
    title: emp.job_title,
    salary: `$${emp.salary ? emp.salary.toLocaleString() : '0'}`,
    status: emp.status === 'Active' ? 'Paid' as const : emp.status === 'Leave' ? 'Absent' as const : 'Pending' as const,
    paymentDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }));
  
  // Get interview statistics - only show for managers
  const interviewStats = isManager ? {
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

  if (isLoadingEmployees || isLoadingInterviews) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="dashboard">
      <TabsContent value="dashboard" className="pt-20 md:pt-24 px-4 sm:px-6 pb-10 animate-fade-in">
        {isManager ? (
          <ManagerDashboard 
            firstName={firstName}
            employeeCount={employeeCount}
            hiredCount={interviews.filter(i => i.stage === 'Hired').length}
            interviewStats={interviewStats}
            salaryEmployees={salaryEmployees}
          />
        ) : (
          <EmployeeDashboard firstName={firstName} />
        )}
      </TabsContent>
    </Tabs>
  );
};

export default Dashboard;
