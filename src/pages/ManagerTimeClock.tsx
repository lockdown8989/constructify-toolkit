
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
  const { isManager, isAdmin, isHR } = useAuth();
  const navigate = useNavigate();
  const { data: employees = [], isLoading } = useEmployees();
  const { toast } = useToast();
  const isLandscape = useMediaQuery('(orientation: landscape)');
  const isMobile = useMediaQuery('(max-width: 640px)');
  const [selectedEmployeeData, setSelectedEmployeeData] = useState<{
    name: string;
    avatar?: string;
  } | null>(null);
  
  const {
    selectedEmployee,
    action,
    isProcessing,
    handleSelectEmployee,
    handleClockAction
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

  // Redirect if not a manager
  useEffect(() => {
    if (!isManager && !isAdmin && !isHR) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page",
        variant: "destructive",
      });
      navigate('/dashboard');
    }
  }, [isManager, isAdmin, isHR, navigate, toast]);

  const handleExitFullscreen = () => {
    navigate('/dashboard');
  };

  return (
    <div className="fixed inset-0 bg-black text-white z-50 flex flex-col landscape:flex-row">
      {/* Header - only visible in portrait mode */}
      <div className="p-4 flex items-center justify-between border-b border-gray-800 portrait:flex landscape:hidden">
        <div className="flex items-center">
          <h1 className="text-xl font-bold tracking-wide">TeamPulse</h1>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleExitFullscreen}
          className="text-white hover:bg-gray-800"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col md:flex-row landscape:flex-row">
        {/* Left side - Employee selection */}
        <div className={`${isLandscape ? 'w-1/3' : 'w-full'} border-r border-gray-800 p-4 overflow-auto landscape:max-h-screen`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Select Employee</h2>
            
            {/* Exit button for landscape mode */}
            <div className="portrait:hidden landscape:flex">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleExitFullscreen}
                className="text-white hover:bg-gray-800"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
          </div>
          
          <EmployeeList
            employees={employees}
            selectedEmployee={selectedEmployee}
            isLoading={isLoading}
            onSelectEmployee={handleSelectEmployee}
          />
        </div>

        {/* Right side - Clock actions */}
        <div className={`${isLandscape ? 'w-2/3' : 'w-full'} p-4 flex flex-col items-center justify-center`}>
          {/* Company logo/header */}
          <div className="text-center mb-6">
            <div className="text-lg uppercase tracking-wider">TeamPulse</div>
            <p className="text-sm text-gray-400">{new Date().toLocaleDateString()}</p>
          </div>
          
          {/* Large digital clock */}
          <div className="text-center mb-10">
            <DigitalClock />
          </div>

          <ClockActions
            selectedEmployee={selectedEmployee}
            action={action}
            selectedEmployeeName={selectedEmployeeData?.name || ''}
            selectedEmployeeAvatar={selectedEmployeeData?.avatar}
            onClockAction={handleClockAction}
            isProcessing={isProcessing}
          />
        </div>
      </div>
    </div>
  );
};

export default ManagerTimeClock;
