import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/auth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useEmployees } from '@/hooks/use-employees';
import { useToast } from '@/hooks/use-toast';
import DigitalClock from '@/components/time-clock/DigitalClock';
import EmployeeList from '@/components/time-clock/EmployeeList';
import ClockActions from '@/components/time-clock/ClockActions';
import { useClockActions } from '@/components/time-clock/useClockActions';
import { useMediaQuery } from '@/hooks/use-media-query';

const ManagerTimeClock = () => {
  const { isManager, isAdmin, isHR, isPayroll } = useAuth();
  const navigate = useNavigate();
  const { data: employees = [], isLoading } = useEmployees();
  const { toast } = useToast();
  const isLandscape = useMediaQuery('(orientation: landscape)');
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  const [selectedEmployeeData, setSelectedEmployeeData] = useState<{
    name: string;
    avatar?: string;
  } | null>(null);
  
  const {
    selectedEmployee,
    action,
    isProcessing,
    employeeStatus,
    handleSelectEmployee,
    handleClockAction,
    handleBreakAction
  } = useClockActions();

  // Update selected employee data when selection changes
  useEffect(() => {
    if (selectedEmployee) {
      const employee = employees.find(emp => emp.id === selectedEmployee);
      if (employee) {
        setSelectedEmployeeData({
          name: employee.name,
          avatar: employee.avatar
        });
      }
    } else {
      setSelectedEmployeeData(null);
    }
  }, [selectedEmployee, employees]);

  // Redirect if not a manager (payroll users should not access this page)
  useEffect(() => {
    if (!isManager && !isAdmin && !isHR) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page",
        variant: "destructive",
      });
      navigate('/dashboard');
    }
    
    // Specifically block payroll users from accessing manager time clock
    if (isPayroll) {
      toast({
        title: "Access Denied",
        description: "Payroll users cannot access the manager time clock",
        variant: "destructive",
      });
      navigate('/dashboard');
    }
  }, [isManager, isAdmin, isHR, isPayroll, navigate, toast]);

  const handleExitFullscreen = () => {
    navigate('/dashboard');
  };

  return (
    <div className="fixed inset-0 bg-black text-white z-50 flex flex-col">
      {/* Header - responsive */}
      <div className="p-3 sm:p-4 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center">
          <h1 className="text-lg sm:text-xl font-bold tracking-wide">TeamPulse</h1>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleExitFullscreen}
          className="text-white hover:bg-gray-800 touch-target"
        >
          <X className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
      </div>

      {/* Main content - responsive layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left side - Employee selection */}
        <div className={`${
          isMobile 
            ? 'w-full' 
            : isTablet 
              ? 'w-2/5' 
              : 'w-1/3'
        } border-r border-gray-800 flex flex-col`}>
          <div className="p-3 sm:p-4 border-b border-gray-800">
            <h2 className="text-base sm:text-lg font-semibold">Select Employee</h2>
          </div>
          
          <div className="flex-1 overflow-auto">
            <EmployeeList
              employees={employees}
              selectedEmployee={selectedEmployee}
              isLoading={isLoading}
              onSelectEmployee={handleSelectEmployee}
            />
          </div>
        </div>

        {/* Right side - Clock actions */}
        <div className={`${
          isMobile 
            ? 'hidden' 
            : isTablet 
              ? 'w-3/5' 
              : 'w-2/3'
        } flex flex-col items-center justify-center p-4 overflow-auto`}>
          {/* Company logo/header */}
          <div className="text-center mb-4 sm:mb-6">
            <div className="text-base sm:text-lg uppercase tracking-wider">TeamPulse</div>
            <p className="text-xs sm:text-sm text-gray-400">{new Date().toLocaleDateString()}</p>
          </div>
          
          {/* Large digital clock */}
          <div className="text-center mb-6 sm:mb-10">
            <DigitalClock />
          </div>

          <ClockActions
            selectedEmployee={selectedEmployee}
            action={action}
            selectedEmployeeName={selectedEmployeeData?.name || ''}
            selectedEmployeeAvatar={selectedEmployeeData?.avatar}
            employeeStatus={employeeStatus}
            onClockAction={handleClockAction}
            onBreakAction={handleBreakAction}
            isProcessing={isProcessing}
          />
        </div>

        {/* Mobile overlay for clock actions */}
        {isMobile && selectedEmployee && (
          <div className="absolute inset-0 bg-black bg-opacity-90 flex flex-col z-10">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Time Clock</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleSelectEmployee('')}
                className="text-white hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-auto">
              {/* Company logo/header */}
              <div className="text-center mb-4">
                <div className="text-base uppercase tracking-wider">TeamPulse</div>
                <p className="text-xs text-gray-400">{new Date().toLocaleDateString()}</p>
              </div>
              
              {/* Digital clock */}
              <div className="text-center mb-6">
                <DigitalClock />
              </div>

              <ClockActions
                selectedEmployee={selectedEmployee}
                action={action}
                selectedEmployeeName={selectedEmployeeData?.name || ''}
                selectedEmployeeAvatar={selectedEmployeeData?.avatar}
                employeeStatus={employeeStatus}
                onClockAction={handleClockAction}
                onBreakAction={handleBreakAction}
                isProcessing={isProcessing}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerTimeClock;
