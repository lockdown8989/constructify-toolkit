
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEmployees } from "@/hooks/use-employees"
import { useState, useEffect } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { format, addMonths, subMonths, startOfMonth } from 'date-fns'
import { useAuth } from "@/hooks/use-auth"

interface AttendanceControlsProps {
  onSearchChange: (value: string) => void;
  onEmployeeSelect?: (employeeId: string) => void;
  onDateChange?: (date: Date) => void;
}

const AttendanceControls = ({ onSearchChange, onEmployeeSelect, onDateChange }: AttendanceControlsProps) => {
  const { data: employees = [] } = useEmployees();
  const { isManager, isAdmin, isHR } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(startOfMonth(new Date()));
  const isMobile = useIsMobile();
  
  // Check if user can select different employees
  const canSelectEmployees = (isManager || isAdmin || isHR) && onEmployeeSelect;
  
  useEffect(() => {
    // Notify parent component of date changes
    onDateChange?.(selectedMonth);
  }, [selectedMonth, onDateChange]);

  const handlePreviousMonth = () => {
    const newDate = subMonths(selectedMonth, 1);
    setSelectedMonth(newDate);
  };
  
  const handleNextMonth = () => {
    const newDate = addMonths(selectedMonth, 1);
    setSelectedMonth(newDate);
  };

  const handleTodayClick = () => {
    const today = startOfMonth(new Date());
    setSelectedMonth(today);
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4 md:mb-6">
      <div className="flex items-center gap-2 w-full md:w-auto">
        <div className="flex items-center p-1 bg-gray-100 rounded-lg">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={handlePreviousMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h3 className="text-sm md:text-base font-medium px-2">
            {format(selectedMonth, 'MMMM yyyy')}
          </h3>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={handleNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        {!isMobile && (
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-2 h-8"
            onClick={handleTodayClick}
          >
            <Calendar className="h-3.5 w-3.5 mr-1.5" />
            <span>Today</span>
          </Button>
        )}
      </div>
      
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full md:w-auto">
        {/* Only show employee selector for managers/admins */}
        {canSelectEmployees && (
          <Select onValueChange={onEmployeeSelect}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Select Employee" />
            </SelectTrigger>
            <SelectContent>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        
        {/* Only show search for managers/admins who can view multiple employees */}
        {canSelectEmployees && (
          <Input 
            type="search" 
            placeholder="Search employee" 
            className="md:w-48 h-9"
            onChange={(e) => onSearchChange(e.target.value)}
          />
        )}
        
        <Select defaultValue="all">
          <SelectTrigger className="w-full md:w-36 h-9">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="present">Present</SelectItem>
            <SelectItem value="absent">Absent</SelectItem>
            <SelectItem value="late">Late</SelectItem>
          </SelectContent>
        </Select>
        
        {isMobile && (
          <Button variant="outline" size="sm" className="h-9">
            <Calendar className="h-3.5 w-3.5 mr-1.5" />
            <span>Today</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default AttendanceControls;
