
import React from 'react';
import ProgressBar from '@/components/dashboard/ProgressBar';

interface DashboardProgressSectionProps {
  interviewStats: {
    interviews: number;
    hired: number;
    projectTime: number;
    output: number;
  };
}

const DashboardProgressSection: React.FC<DashboardProgressSectionProps> = ({ interviewStats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
      <ProgressBar label="Interviews" value={Math.round(interviewStats.interviews) || 0} color="black" />
      <ProgressBar label="Hired" value={Math.round(interviewStats.hired) || 0} color="yellow" />
      <ProgressBar label="Project time" value={interviewStats.projectTime} color="gray" />
      <ProgressBar label="Output" value={interviewStats.output} color="black" />
    </div>
  );
};

export default DashboardProgressSection;
