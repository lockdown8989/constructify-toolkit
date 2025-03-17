
import React, { useState } from 'react';
import ProgressBar from '@/components/dashboard/ProgressBar';
import StatCard from '@/components/dashboard/StatCard';
import Calendar from '@/components/dashboard/Calendar';
import SalaryTable from '@/components/dashboard/SalaryTable';
import AttendanceReport from '@/components/dashboard/AttendanceReport';
import HiringStatistics from '@/components/dashboard/HiringStatistics';
import EmployeeComposition from '@/components/dashboard/EmployeeComposition';
import { Users, Briefcase, FolderOpen } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEmployees } from '@/hooks/use-employees';
import { useInterviews } from '@/hooks/use-interviews';

const Dashboard = () => {
  const isMobile = useIsMobile();
  const { data: employees = [], isLoading: isLoadingEmployees } = useEmployees();
  const { data: interviews = [], isLoading: isLoadingInterviews } = useInterviews();
  
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
    avatar: emp.avatar || `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'women' : 'men'}/${Math.floor(Math.random() * 99)}.jpg`,
    title: emp.job_title,
    salary: `$${emp.salary.toLocaleString()}`,
    status: emp.status === 'Active' ? 'Paid' : emp.status === 'Leave' ? 'Absent' : 'Pending'
  }));
  
  // Get interview statistics
  const interviewStats = {
    interviews: interviews.filter(i => i.stage === 'Interview').reduce((acc, i) => acc + i.progress, 0) / 
                Math.max(interviews.filter(i => i.stage === 'Interview').length, 1),
    hired: interviews.filter(i => i.stage === 'Hired').reduce((acc, i) => acc + i.progress, 0) / 
           Math.max(interviews.filter(i => i.stage === 'Hired').length, 1),
    projectTime: 15, // Sample data, would come from project table
    output: 5 // Sample data, would come from project table
  };
  
  const hiringData = [
    { name: 'Jan', design: 120, others: 130 },
    { name: 'Feb', design: 100, others: 110 },
    { name: 'Mar', design: 140, others: 120 },
    { name: 'Apr', design: 120, others: 140 },
    { name: 'May', design: 90, others: 160 },
    { name: 'Jun', design: 120, others: 140 },
    { name: 'Jul', design: 90, others: 110 },
    { name: 'Aug', design: 110, others: 90 },
    { name: 'Sep', design: 130, others: 70 },
    { name: 'Oct', design: 110, others: 100 },
    { name: 'Nov', design: 120, others: 130 },
    { name: 'Dec', design: 140, others: 110 },
  ];
  
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  
  const handleSelectEmployee = (id: string) => {
    setSelectedEmployee(id === selectedEmployee ? null : id);
  };

  return (
    <div className="pt-20 md:pt-24 px-4 sm:px-6 pb-10 animate-fade-in">
      <div className="max-w-[1800px] mx-auto">
        <h1 className="text-2xl md:text-4xl font-bold mb-2">Hello Valentina</h1>
        
        {/* Progress Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <ProgressBar label="Interviews" value={Math.round(interviewStats.interviews) || 0} color="black" />
          <ProgressBar label="Hired" value={Math.round(interviewStats.hired) || 0} color="yellow" />
          <ProgressBar label="Project time" value={interviewStats.projectTime} color="gray" />
          <ProgressBar label="Output" value={interviewStats.output} color="black" />
        </div>
        
        {/* Stats */}
        <div className="flex flex-wrap -mx-2 mb-6">
          <div className="w-full sm:w-1/2 lg:w-1/3 px-2 mb-4 sm:mb-0">
            <StatCard 
              title="Employee" 
              value={employees.length.toString()} 
              icon={<Users className="w-5 h-5" />}
              className="h-full"
            />
          </div>
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
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-3">
            <Calendar meetings={sampleMeetings} />
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
            <AttendanceReport 
              present={Math.round((employees.filter(e => e.status === 'Active').length / Math.max(employees.length, 1)) * 100)} 
              absent={Math.round((employees.filter(e => e.status === 'Leave').length / Math.max(employees.length, 1)) * 100)} 
              className="mb-6" 
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <HiringStatistics data={hiringData} className="col-span-1" />
              <EmployeeComposition 
                total={employees.length} 
                femalePercentage={70} 
                malePercentage={30} 
                className="col-span-1" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
