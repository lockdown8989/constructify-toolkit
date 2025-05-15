
import React, { useState, useEffect } from 'react';
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
import { useIsMobile, useOrientation } from '@/hooks/use-mobile';
import PinCodeEntry from '@/components/time-clock/PinCodeEntry';

const ManagerTimeClock = () => {
  const { isManager, isAdmin, isHR } = useAuth();
  const navigate = useNavigate();
  const { data: employees = [], isLoading } = useEmployees();
  const { toast } = useToast();
  const {
    selectedEmployee,
    selectedEmployeeName,
    action,
    showPinEntry,
    handleSelectEmployee,
    handleClockAction,
    handlePinSubmit,
    handleCancelPin
  } = useClockActions();
  const isMobile = useIsMobile();
  const orientation = useOrientation();
  
  // Responsive design state
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  
  // Update device type on resize
  useEffect(() => {
    const updateDeviceType = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width <= 1366) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };
    
    window.addEventListener('resize', updateDeviceType);
    updateDeviceType();
    
    return () => window.removeEventListener('resize', updateDeviceType);
  }, []);
  
  // Redirect if not a manager
  useEffect(() => {
    if (!isManager && !isAdmin && !isHR) {
      navigate('/dashboard');
    }
  }, [isManager, isAdmin, isHR, navigate]);
  
  if (!isManager && !isAdmin && !isHR) return null;

  const handleExitFullscreen = () => {
    navigate('/dashboard');
  };

  // Define layout classes based on device and orientation
  const containerClasses = deviceType === 'mobile' 
    ? 'flex flex-col h-full'
    : orientation === 'landscape' 
      ? 'flex flex-row h-full' 
      : 'flex flex-col h-full';
  
  const sidebarClasses = deviceType === 'mobile'
    ? 'w-full h-[40vh] border-b border-gray-800 overflow-auto'
    : orientation === 'landscape'
      ? 'w-1/3 max-w-md border-r border-gray-800 overflow-auto h-full'
      : 'w-full h-1/3 border-b border-gray-800 overflow-auto';
  
  const mainContentClasses = deviceType === 'mobile'
    ? 'w-full h-[60vh] flex flex-col items-center justify-center p-4'
    : orientation === 'landscape'
      ? 'w-2/3 flex-1 flex flex-col items-center justify-center p-4'
      : 'w-full h-2/3 flex flex-col items-center justify-center p-4';
  
  const clockSizeClass = deviceType === 'mobile'
    ? 'text-6xl'
    : deviceType === 'tablet'
      ? orientation === 'landscape' ? 'tablet-clock text-9xl' : 'text-7xl'
      : 'digital-clock text-8xl';

  return (
    <div className="fixed inset-0 bg-black text-white z-50 flex flex-col">
      {/* Header - shown on all layouts */}
      <div className="p-4 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center">
          <h1 className="text-xl font-bold flex items-center">
            <span className="text-red-500 mr-1">⏰️</span>IN 
            <span className="text-gray-300 mr-1 ml-1">⏱️</span>OUT
          </h1>
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

      {/* PIN Entry Overlay */}
      {showPinEntry && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="max-w-md w-full">
            <PinCodeEntry 
              onComplete={handlePinSubmit} 
              onCancel={handleCancelPin}
              title={action === 'in' ? `Clock In: ${selectedEmployeeName}` : `Clock Out: ${selectedEmployeeName}`}
              action={action || undefined}
              userName={selectedEmployeeName}
            />
          </div>
        </div>
      )}

      {/* Main content with responsive layout */}
      <div className={containerClasses}>
        {/* Left side - Employee selection */}
        <div className={sidebarClasses}>
          <div className="flex items-center justify-between px-4 py-2">
            <h2 className="text-lg font-semibold">Select Employee</h2>
          </div>
          
          <EmployeeList
            employees={employees}
            selectedEmployee={selectedEmployee}
            isLoading={isLoading}
            onSelectEmployee={handleSelectEmployee}
          />
        </div>

        {/* Right side - Clock actions */}
        <div className={mainContentClasses}>
          {/* Company logo/header */}
          <div className="text-center mb-6">
            <div className="text-2xl uppercase tracking-wider">TeamPulse</div>
            <p className="text-sm text-gray-400">{new Date().toLocaleDateString()}</p>
          </div>
          
          {/* Large digital clock */}
          <div className="text-center mb-10">
            <DigitalClock className={clockSizeClass} />
          </div>

          {/* Clock action buttons - bigger on tablets */}
          <ClockActions
            selectedEmployee={selectedEmployee}
            action={action}
            selectedEmployeeName={selectedEmployeeName}
            onClockAction={handleClockAction}
          />
        </div>
      </div>
    </div>
  );
};

export default ManagerTimeClock;
