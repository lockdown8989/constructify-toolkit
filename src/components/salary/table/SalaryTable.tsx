
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Employee } from '@/types/employee';
import { SearchBar } from '@/components/dashboard/salary-table/SearchBar';
import { PayslipActions } from '@/components/dashboard/salary-table/PayslipActions';
import { StatusActions } from '@/components/dashboard/salary-table/StatusActions';
import { PayslipData } from '@/types/supabase/payroll';
import { format } from 'date-fns';

export interface SalaryTableProps {
  employees: Employee[];
  onSelectEmployee: (id: string) => void;
  className?: string;
  onUpdateStatus?: (id: string, status: "Paid" | "Absent" | "Pending") => void;
}

export const SalaryTable: React.FC<SalaryTableProps> = ({
  employees,
  onSelectEmployee,
  className = "",
  onUpdateStatus
}) => {
  const [filteredEmployees, setFilteredEmployees] = React.useState<Employee[]>(employees);
  const [searchTerm, setSearchTerm] = React.useState("");
  
  React.useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredEmployees(employees);
    } else {
      const filtered = employees.filter(emp => 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEmployees(filtered);
    }
  }, [searchTerm, employees]);
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };
  
  const handleGeneratePayslip = (employeeData: Employee) => {
    // Convert the employee data to the expected PayslipData format
    const payslipData: PayslipData = {
      employeeId: employeeData.id,
      name: employeeData.name,
      department: employeeData.department,
      position: employeeData.job_title,
      payPeriod: format(new Date(), 'yyyy-MM'),
      grossPay: employeeData.salary.toString(),
      taxes: (employeeData.salary * 0.2).toString(), // Simplified tax calculation (20%)
      netPay: (employeeData.salary * 0.8).toString(),
      paymentDate: format(new Date(), 'yyyy-MM-dd'),
      bankAccount: '****1234',
      title: 'Monthly Payslip',
      salary: employeeData.salary.toString(),
    };
    
    onSelectEmployee(employeeData.id);
  };
  
  return (
    <div className={`space-y-4 ${className}`}>
      <SearchBar onSearch={handleSearch} />
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell className="font-medium">{emp.name}</TableCell>
                  <TableCell>{emp.department}</TableCell>
                  <TableCell>${emp.salary}</TableCell>
                  <TableCell className="flex gap-2">
                    <PayslipActions 
                      employee={emp}
                      onGenerate={() => handleGeneratePayslip(emp)}
                    />
                    {onUpdateStatus && (
                      <StatusActions 
                        employeeId={emp.id}
                        onUpdateStatus={onUpdateStatus}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  No employees found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SalaryTable;
