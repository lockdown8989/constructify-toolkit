
import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import SalaryOverview from '@/components/salary/SalaryOverview';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, ChevronLeft, ChevronRight, Search, Shield, DollarSign } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { useEmployees } from '@/hooks/use-employees';
import { useIsMobile, useIsTablet } from '@/hooks/use-mobile';
import EmployeeSalaryCard from '@/components/salary/EmployeeSalaryCard';
import SalaryCalendarView from '@/components/salary/SalaryCalendarView';
import EmployeeDetailsPanel from '@/components/salary/EmployeeDetailsPanel';
import SalaryStatsSection from '@/components/salary/SalaryStatsSection';

const SalaryPage = () => {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addMonths(new Date(), 1),
  });

  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  // Fetch all employees for payroll users
  const { data: employees = [], isLoading, error } = useEmployees();
  const { user, isPayroll } = useAuth();

  console.log("Salary page - employees data:", employees.length, "isPayroll:", isPayroll);

  // Only allow payroll users to access this page
  if (!isPayroll) {
    return (
      <div className="container py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600 mt-2">This page is only accessible to payroll users.</p>
        </div>
      </div>
    );
  }

  React.useEffect(() => {
    if (employees.length > 0 && !selectedEmployee) {
      const firstEmployee = employees[0];
      if (firstEmployee) {
        setSelectedEmployee(firstEmployee.id);
      }
    }
    // This effect should only run when the employees list loads, not when selection changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employees]);

  const handlePreviousMonth = () => {
    setSelectedMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth(prev => addMonths(prev, 1));
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedEmployeeData = employees.find(emp => emp.id === selectedEmployee);

  if (isLoading) {
    return (
      <div className="container py-6">
        <div className="text-center">
          <div className="animate-pulse">Loading employee data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error("Error loading employees:", error);
    return (
      <div className="container py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error Loading Data</h1>
          <p className="text-gray-600 mt-2">Please check your permissions and try again.</p>
          <p className="text-sm text-gray-500 mt-1">Error: {error.message}</p>
        </div>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="container py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-600">No Employees Found</h1>
          <p className="text-gray-600 mt-2">No employee data is available for payroll management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 animate-fade-in">
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <DollarSign className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Salary Management</h1>
        </div>
        <p className="text-muted-foreground">
          Manage employee salaries and compensation - {employees.length} employees loaded
        </p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left sidebar - Employee list */}
        <div className={cn(
          "lg:col-span-3",
          selectedEmployee && (isMobile || isTablet) && "hidden"
        )}>
          <Card className="rounded-3xl overflow-hidden">
            <div className="p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search employees"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-full bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>
              
              <div className="space-y-2 max-h-[calc(100vh-240px)] overflow-y-auto">
                {filteredEmployees.length === 0 ? (
                  <div className="flex justify-center p-4">
                    <div className="text-gray-500 text-sm">
                      {employees.length === 0 ? 'No employees found' : 'No matching employees'}
                    </div>
                  </div>
                ) : (
                  filteredEmployees.map(employee => (
                    <EmployeeSalaryCard
                      key={employee.id}
                      employee={employee}
                      isSelected={selectedEmployee === employee.id}
                      onClick={() => setSelectedEmployee(employee.id)}
                    />
                  ))
                )}
              </div>
            </div>
            
            {!isMobile && (
              <div className="flex justify-between items-center px-6 py-3 bg-gray-50 border-t">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedEmployee(null)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                
                <div className="flex space-x-4">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate('/people')}
                  >
                    View All
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
        
        {/* Main content - Calendar and Stats */}
        <div className={cn(
          "lg:col-span-6",
          selectedEmployee && (isMobile || isTablet) && "hidden"
        )}>
          <SalaryStatsSection />
          
          <Card className="rounded-3xl p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <Button variant="ghost" size="icon" onClick={handlePreviousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h3 className="text-lg font-medium px-2">
                  {format(selectedMonth, 'MMMM yyyy')}
                </h3>
                <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="h-8">
                  <Shield className="h-3.5 w-3.5 mr-1" />
                  View Policies
                </Button>
                <DateRangePicker
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                  className="w-auto"
                />
              </div>
            </div>
            
            <SalaryCalendarView
              month={selectedMonth}
              employees={employees}
            />
          </Card>
        </div>
        
        {/* Right panel - Employee details */}
        <div className={cn(
          "lg:col-span-3",
          !selectedEmployee && (isMobile || isTablet) && "hidden"
        )}>
          {selectedEmployeeData && (
            <EmployeeDetailsPanel 
              employee={selectedEmployeeData}
              onBack={() => setSelectedEmployee(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SalaryPage;
