import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import SalaryOverview from '@/components/salary/SalaryOverview';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, ChevronLeft, ChevronRight, Search, Shield } from 'lucide-react';
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

  const { data: employees = [], isLoading } = useEmployees();
  const { user, isManager, isAdmin, isHR } = useAuth();

  // If user is a regular employee, show the simplified salary overview
  const isEmployee = user && !isManager && !isAdmin && !isHR;
  
  if (isEmployee) {
    return <SalaryOverview />;
  }

  React.useEffect(() => {
    if (isEmployee && employees.length > 0) {
      const ownEmployee = employees.find(emp => emp.user_id === user?.id);
      if (ownEmployee) {
        setSelectedEmployee(ownEmployee.id);
      }
    }
  }, [isEmployee, employees, user?.id]);

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

  return (
    <div className="container py-6 animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Salary</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left sidebar - Employee list */}
        <div className={cn(
          "lg:col-span-3",
          selectedEmployee && (isMobile || isTablet) && "hidden",
          isEmployee && "hidden lg:block" // Hide the list for regular employees on mobile, show on desktop
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
                {isLoading ? (
                  <div className="flex justify-center p-4">
                    <div className="animate-pulse">Loading employees...</div>
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
          selectedEmployee && (isMobile || isTablet) && "hidden",
          isEmployee && !selectedEmployeeData && "hidden" // Hide for regular employees if no selection
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
              employees={isEmployee ? employees.filter(emp => emp.user_id === user?.id) : employees}
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
