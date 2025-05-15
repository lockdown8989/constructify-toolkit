
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
import { useIsMobile } from '@/hooks/use-mobile';
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
  const [orientation, setOrientation] = useState(
    window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
  );
  
  // Update orientation on resize
  useEffect(() => {
    const updateOrientation = () => {
      setOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');
    };
    
    window.addEventListener('resize', updateOrientation);
    return () => window.removeEventListener('resize', updateOrientation);
  }, []);

  // Redirect if not a manager
  if (!isManager && !isAdmin && !isHR) {
    navigate('/dashboard');
    return null;
  }

  const handleExitFullscreen = () => {
    navigate('/dashboard');
  };

  // Define the layout based on device and orientation
  const isTablet = window.innerWidth >= 768 && window.innerWidth <= 1024;
  const isLargeTablet = window.innerWidth > 1024 && window.innerWidth <= 1366;

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
            />
          </div>
        </div>
      )}

      {/* Main content with responsive layout */}
      <div className={`flex flex-1 ${orientation === 'landscape' ? 'flex-row' : 'flex-col'}`}>
        {/* Left side - Employee selection */}
        <div className={`
          ${orientation === 'landscape' ? 'w-1/3 max-w-md' : 'w-full h-1/2'} 
          border-gray-800 
          ${orientation === 'landscape' ? 'border-r' : 'border-b'}
          p-4 overflow-auto
        `}>
          <div className="flex items-center justify-between mb-4">
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
        <div className={`
          ${orientation === 'landscape' ? 'w-2/3' : 'w-full h-1/2'} 
          p-4 flex flex-col items-center justify-center
        `}>
          {/* Company logo/header */}
          <div className="text-center mb-6">
            <div className="text-2xl uppercase tracking-wider">TeamPulse</div>
            <p className="text-sm text-gray-400">{new Date().toLocaleDateString()}</p>
          </div>
          
          {/* Large digital clock */}
          <div className="text-center mb-10">
            <DigitalClock />
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
