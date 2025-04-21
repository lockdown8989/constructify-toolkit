
import React from 'react';
import type { Employee } from '@/hooks/use-employees';

interface EmployeeInfoProps {
  employee: Employee;
}

const EmployeeInfo: React.FC<EmployeeInfoProps> = ({ employee }) => {
  return (
    <div className="text-center mb-6">
      <h2 className="text-xl font-bold">{employee.name}</h2>
      <p className="text-gray-500">{employee.job_title}</p>
    </div>
  );
};

export default EmployeeInfo;
