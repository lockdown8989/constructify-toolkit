
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Employee } from '@/components/salary/table/types';
import { SearchBar } from '@/components/dashboard/salary-table/SearchBar';
import { PayslipActions } from '@/components/dashboard/salary-table/PayslipActions';
import { StatusActions } from '@/components/dashboard/salary-table/StatusActions';
import { PayslipData } from '@/types/supabase/payroll';
import { format } from 'date-fns';
import { formatCurrency } from '@/utils/format';

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
        emp.department?.toLowerCase().includes(searchTerm.toLowerCase())
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
      id: employeeData.id,
      employeeId: employeeData.id,
      employeeName: employeeData.name,
      name: employeeData.name, // For backward compatibility
      department: employeeData.department || '',
      position: employeeData.title || employeeData.job_title || '',
      payPeriod: format(new Date(), 'yyyy-MM'),
      period: format(new Date(), 'yyyy-MM'),
      grossPay: typeof employeeData.salary === 'number' ? employeeData.salary : parseFloat(String(employeeData.salary)),
      taxes: typeof employeeData.salary === 'number' ? employeeData.salary * 0.2 : parseFloat(String(employeeData.salary)) * 0.2, // Simplified tax calculation (20%)
      netPay: typeof employeeData.salary === 'number' ? employeeData.salary * 0.8 : parseFloat(String(employeeData.salary)) * 0.8,
      paymentDate: format(new Date(), 'yyyy-MM-dd'),
      baseSalary: typeof employeeData.salary === 'number' ? employeeData.salary : parseFloat(String(employeeData.salary)),
      deductions: 0,
      currency: 'GBP',
      bankAccount: '****1234',
      title: 'Monthly Payslip',
      salary: employeeData.salary,
      overtimePay: 0,
      bonus: 0,
      totalPay: typeof employeeData.salary === 'number' ? employeeData.salary : parseFloat(String(employeeData.salary)),
      notes: ''
    };
    
    onSelectEmployee(employeeData.id);
  };
  
  // Fix the status check in the table rows
  return (
    <div className={`space-y-4 ${className}`}>
      <SearchBar value={searchTerm} onChange={handleSearch} />
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
                  <TableCell>{formatCurrency(emp.salary)}</TableCell>
                  <TableCell className="flex gap-2">
                    <PayslipActions 
                      employee={{
                        ...emp,
                        title: emp.title || emp.job_title || '',
                        status: (emp.status === 'Paid' || emp.status === 'Pending' || emp.status === 'Absent') ? 
                                emp.status as 'Paid' | 'Pending' | 'Absent' : 'Pending',
                        paymentDate: emp.paymentDate || format(new Date(), 'yyyy-MM-dd')
                      }}
                      onGenerate={() => handleGeneratePayslip(emp)}
                    />
                    {onUpdateStatus && (
                      <StatusActions 
                        onStatusChange={(status) => onUpdateStatus(emp.id, status)}
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
