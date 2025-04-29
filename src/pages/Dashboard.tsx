
import React from 'react';
import { useAuth } from '@/hooks/auth';
import { useEmployees } from '@/hooks/use-employees';
import { useInterviews } from '@/hooks/use-interviews';
import EmployeeStatistics from '@/components/people/EmployeeStatistics';
import DocumentList from '@/components/salary/components/DocumentList';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import EmployeeAttendanceSummary from '@/components/dashboard/EmployeeAttendanceSummary';
import { useAttendanceSync } from '@/hooks/use-attendance-sync';
import { Users, FolderOpen } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import ProgressBar from '@/components/dashboard/ProgressBar';
import StatCard from '@/components/dashboard/StatCard';
import Calendar from '@/components/dashboard/Calendar';
import DashboardTimeClock from '@/components/dashboard/DashboardTimeClock';
import SalaryTable from '@/components/salary/table/SalaryTable';
import AttendanceReport from '@/components/dashboard/AttendanceReport';
import HiringStatistics from '@/components/dashboard/HiringStatistics';
import EmployeeComposition from '@/components/dashboard/EmployeeComposition';
import { useEmployeeDataManagement } from '@/hooks/use-employee-data-management';

const Dashboard = () => {
  const { isManager, user } = useAuth();
  const isMobile = useIsMobile();
  const { data: employees = [], isLoading: isLoadingEmployees } = useEmployees();
  const { data: interviews = [], isLoading: isLoadingInterviews } = useInterviews();
  const { employeeId: currentEmployeeId } = useEmployeeDataManagement();
  
  useAttendanceSync(); // Enable real-time sync at the dashboard level

  // Get user's first name for greeting
  const firstName = user?.user_metadata?.first_name || 
                   user?.email?.split('@')[0] || 
                   'User';

  // For employee users
  if (!isManager) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-2xl font-bold mb-6">Hello {firstName}</h1>
        <div className="grid gap-6">
          <EmployeeAttendanceSummary />
          
          <Card className="p-6">
            <h3 className="text-xs font-semibold text-gray-500 mb-5 uppercase tracking-wider">
              Statistics
            </h3>
            <EmployeeStatistics employeeId={currentEmployeeId} />
          </Card>
          
          <Card className="p-6">
            <h3 className="text-xs font-semibold text-gray-500 mb-5 uppercase tracking-wider">
              Documents
            </h3>
            <DocumentList employeeId={currentEmployeeId} />
          </Card>
        </div>
      </div>
    );
  }

  // Count employees excluding the manager themselves
  const employeeCount = isManager 
    ? employees.filter(emp => emp.user_id !== user?.id).length 
    : 1;
  
  // Sample data for meetings (would come from another table in a real app)
  const sampleMeetings = [
    { id: '1', title: 'Daily Sync', time: '09:30', date: new Date(), dotColor: 'yellow' as const },
    { id: '2', title: 'Task Review With Team', time: '11:00', date: new Date(), dotColor: 'black' as const },
    { id: '3', title: 'Daily Meeting', time: '12:00', date: new Date(), dotColor: 'yellow' as const },
  ];
  
  // Transform employees data for the SalaryTable
  const salaryEmployees = employees.slice(0, 3).map(emp => ({
    id: emp.id,
    name: emp.name,
    avatar: emp.avatar || `https://randomuser.me/api/portraits//${Math.random() > 0.5 ? 'women' : 'men'}/${Math.floor(Math.random() * 99)}.jpg`,
    title: emp.job_title,
    salary: `$${emp.salary.toLocaleString()}`,
    status: emp.status === 'Active' ? 'Paid' as const : emp.status === 'Leave' ? 'Absent' as const : 'Pending' as const
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
  
  const [selectedEmployee, setSelectedEmployee] = React.useState<string | null>(null);
  
  const handleSelectEmployee = (id: string) => {
    setSelectedEmployee(id === selectedEmployee ? null : id);
  };

  // Determine if the user is a regular employee (not a manager)
  const isEmployee = user && !isManager;

  return (
    <div className="pt-20 md:pt-24 px-4 sm:px-6 pb-10 animate-fade-in">
      <div className="max-w-[1800px] mx-auto">
        <h1 className="text-2xl md:text-4xl font-bold mb-2">Hello {firstName}</h1>
        
        {/* Progress Bars - Only show for managers */}
        {isManager && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <ProgressBar label="Interviews" value={Math.round(interviewStats.interviews) || 0} color="black" />
            <ProgressBar label="Hired" value={Math.round(interviewStats.hired) || 0} color="yellow" />
            <ProgressBar label="Project time" value={interviewStats.projectTime} color="gray" />
            <ProgressBar label="Output" value={interviewStats.output} color="black" />
          </div>
        )}
        
        {/* Stats */}
        <div className="flex flex-wrap -mx-2 mb-6">
          <div className="w-full sm:w-1/2 lg:w-1/3 px-2 mb-4 sm:mb-0">
            <StatCard 
              title={isManager ? "Team Members" : "Employee"} 
              value={employeeCount.toString()} 
              icon={<Users className="w-5 h-5" />}
              className="h-full"
            />
          </div>
          {isManager && (
            <>
              <div className="w-full sm:w-1/2 lg:w-1/3 px-2 mb-4 sm:mb-0">
                <StatCard 
                  title="Hirings" 
                  value={interviews.filter(i => i.stage === 'Hired').length.toString()} 
                  icon={<Users className="w-5 h-5" />}
                  className="h-full"
                />
              </div>
              <div className="w-full sm:w-1/2 lg:w-1/3 px-2 mb-4 sm:mb-0">
                <StatCard 
                  title="Projects" 
                  value="185" 
                  icon={<FolderOpen className="w-5 h-5" />}
                  className="h-full"
                />
              </div>
            </>
          )}
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-3">
            {isEmployee ? (
              <DashboardTimeClock />
            ) : (
              <Calendar meetings={sampleMeetings} />
            )}
          </div>
          
          {/* Middle Column */}
          <div className="lg:col-span-5">
            <SalaryTable 
              employees={salaryEmployees.map(emp => ({
                ...emp,
                selected: emp.id === selectedEmployee
              }))} 
              onSelectEmployee={handleSelectEmployee}
            />
          </div>
          
          {/* Right Column */}
          <div className="lg:col-span-4">
            {/* Updated to use the enhanced AttendanceReport */}
            <AttendanceReport 
              employeeId={selectedEmployee ?? undefined}
              className="mb-6" 
            />
            
            {/* Only show stats for managers */}
            {isManager && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <HiringStatistics className="col-span-1" />
                <EmployeeComposition className="col-span-1" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
