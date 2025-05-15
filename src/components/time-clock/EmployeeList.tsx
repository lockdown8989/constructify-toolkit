
import { User, UserCheck } from 'lucide-react';
import { Employee } from '@/types/employee';

interface EmployeeListProps {
  employees: Employee[];
  selectedEmployee: string | null;
  isLoading: boolean;
  onSelectEmployee: (employeeId: string) => void;
}

const EmployeeList = ({
  employees,
  selectedEmployee,
  isLoading,
  onSelectEmployee
}: EmployeeListProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2">
      {employees.map((employee) => (
        <div 
          key={employee.id}
          className={`cursor-pointer p-3 flex items-center rounded-lg transition-all ${
            selectedEmployee === employee.id 
              ? 'bg-gray-800 border border-teal-500' 
              : 'hover:bg-gray-800'
          }`}
          onClick={() => onSelectEmployee(employee.id)}
        >
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mr-3 overflow-hidden">
            {employee.avatar ? (
              <img src={employee.avatar} alt={employee.name} className="w-full h-full object-cover" />
            ) : (
              <UserCheck className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <div>
            <h3 className="font-medium">{employee.name}</h3>
            <p className="text-sm text-gray-400">{employee.job_title || 'No title'}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmployeeList;
