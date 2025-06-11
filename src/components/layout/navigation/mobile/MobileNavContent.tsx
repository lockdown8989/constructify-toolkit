
import React from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useTimeClock } from '@/hooks/time-clock';
import MobileNavHeader from './MobileNavHeader';
import TimeClocksSection from './TimeClocksSection';
import CommonSection from './CommonSection';
import ManagerSection from './ManagerSection';
import WorkflowSection from './WorkflowSection';
import ClockingControls from './ClockingControls';
import MobileNavDivider from './MobileNavDivider';

interface MobileNavContentProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  isEmployee: boolean;
  hasManagerialAccess: boolean;
  isPayroll: boolean;
}

const MobileNavContent: React.FC<MobileNavContentProps> = ({
  isOpen,
  onClose,
  isAuthenticated,
  isEmployee,
  hasManagerialAccess,
  isPayroll
}) => {
  const { user } = useAuth();
  const { status, handleClockIn, handleClockOut, handleBreakStart, handleBreakEnd } = useTimeClock();
  
  // Only show clocking controls for employees who are not managers or payroll users
  const isClockingEnabled = isEmployee && !hasManagerialAccess && !isPayroll && isAuthenticated;
  
  console.log("MobileNavContent - isPayroll:", isPayroll);
  console.log("MobileNavContent - isClockingEnabled:", isClockingEnabled);
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl">
        <div className="flex h-full flex-col">
          <MobileNavHeader onClose={onClose} />
          
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <div className="space-y-2">
              <CommonSection 
                isAuthenticated={isAuthenticated}
                isEmployee={isEmployee}
                hasManagerialAccess={hasManagerialAccess}
                isPayroll={isPayroll}
                onClose={onClose}
              />
              
              {/* Manager sections - only for managers who are not payroll users */}
              {isAuthenticated && hasManagerialAccess && !isPayroll && (
                <>
                  <MobileNavDivider />
                  <ManagerSection 
                    hasManagerialAccess={hasManagerialAccess}
                    onClose={onClose} 
                  />
                  
                  <MobileNavDivider />
                  <TimeClocksSection 
                    onClose={onClose}
                    isAuthenticated={isAuthenticated}
                    hasManagerialAccess={hasManagerialAccess}
                  />
                </>
              )}
              
              {/* Employee workflow - only for non-manager, non-payroll employees */}
              {isEmployee && !hasManagerialAccess && !isPayroll && (
                <>
                  <MobileNavDivider />
                  <WorkflowSection 
                    hasManagerialAccess={hasManagerialAccess}
                    onClose={onClose} 
                  />
                </>
              )}
            </div>
          </div>

          {/* Only show clocking controls for regular employees */}
          {isClockingEnabled && (
            <div className="border-t p-4">
              <ClockingControls 
                isClockingEnabled={isClockingEnabled}
                status={status}
                handleClockIn={handleClockIn}
                handleClockOut={handleClockOut}
                handleBreakStart={handleBreakStart}
                handleBreakEnd={handleBreakEnd}
                onClose={onClose}
              />
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 hover:bg-gray-100"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default MobileNavContent;
