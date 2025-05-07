
import React from 'react';
import { Users, FolderOpen } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';

interface DashboardStatsSectionProps {
  employeeCount: number;
  hiredCount: number;
  isManager: boolean;
}

const DashboardStatsSection: React.FC<DashboardStatsSectionProps> = ({ 
  employeeCount, 
  hiredCount,
  isManager 
}) => {
  return (
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
              value={hiredCount.toString()} 
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
  );
};

export default DashboardStatsSection;
