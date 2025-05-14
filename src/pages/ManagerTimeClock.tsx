
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X, UserCheck } from 'lucide-react';
import { useEmployees } from '@/hooks/use-employees';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

const ManagerTimeClock = () => {
  const { isManager, isAdmin, isHR } = useAuth();
  const navigate = useNavigate();
  const { data: employees = [], isLoading } = useEmployees();
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [action, setAction] = useState<'in' | 'out' | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { toast } = useToast();

  // Redirect if not a manager
  if (!isManager && !isAdmin && !isHR) {
    navigate('/dashboard');
    return null;
  }

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Format time as HH:MM
  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleExitFullscreen = () => {
    navigate('/dashboard');
  };

  const handleSelectEmployee = (employeeId: string) => {
    setSelectedEmployee(employeeId);
  };

  const handleClockAction = async (clockAction: 'in' | 'out') => {
    if (!selectedEmployee) {
      toast({
        title: "No employee selected",
        description: "Please select an employee first",
        variant: "destructive",
      });
      return;
    }

    setAction(clockAction);
    
    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      if (clockAction === 'in') {
        // Check if there's already an active session for today
        const { data: existingRecord } = await supabase
          .from('attendance')
          .select('id, active_session')
          .eq('employee_id', selectedEmployee)
          .eq('date', today)
          .maybeSingle();
          
        if (existingRecord?.active_session) {
          toast({
            title: "Already clocked in",
            description: "This employee is already clocked in for today",
            variant: "destructive",
          });
          return;
        }
        
        // Clock in
        const { error } = await supabase
          .from('attendance')
          .upsert({
            employee_id: selectedEmployee,
            date: today,
            check_in: now.toISOString(),
            active_session: true,
            attendance_status: 'Present',
            device_info: 'Manager Dashboard',
            notes: 'Clocked in by manager'
          }, {
            onConflict: 'employee_id,date'
          });
          
        if (error) throw error;
        
        toast({
          title: "Clocked In",
          description: `Employee clocked in at ${format(now, 'h:mm a')}`,
        });
      } else {
        // Find active session
        const { data: activeSession } = await supabase
          .from('attendance')
          .select('*')
          .eq('employee_id', selectedEmployee)
          .eq('active_session', true)
          .maybeSingle();
          
        if (!activeSession) {
          toast({
            title: "No active session",
            description: "This employee is not clocked in",
            variant: "destructive",
          });
          return;
        }
        
        // Calculate working minutes
        const checkInTime = new Date(activeSession.check_in);
        const workingMinutes = Math.round((now.getTime() - checkInTime.getTime()) / (1000 * 60));
        
        // Clock out
        const { error } = await supabase
          .from('attendance')
          .update({
            check_out: now.toISOString(),
            active_session: false,
            working_minutes: workingMinutes,
            overtime_minutes: Math.max(0, workingMinutes - 480) // Over 8 hours
          })
          .eq('id', activeSession.id);
          
        if (error) throw error;
        
        toast({
          title: "Clocked Out",
          description: `Employee clocked out at ${format(now, 'h:mm a')}`,
        });
      }

      // Reset state
      setTimeout(() => {
        setSelectedEmployee(null);
        setAction(null);
      }, 2000);
      
    } catch (error) {
      console.error('Error with clock action:', error);
      toast({
        title: "Error",
        description: "There was an error processing the clock action",
        variant: "destructive",
      });
    }
  };

  const getEmployeeStatus = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee?.status || 'Unknown';
  };
  
  const getSelectedEmployeeName = () => {
    if (!selectedEmployee) return '';
    const employee = employees.find(emp => emp.id === selectedEmployee);
    return employee?.name || 'Employee';
  };

  return (
    <div className="fixed inset-0 bg-black text-white z-50 flex flex-col landscape:flex-row">
      {/* Header - only visible in portrait mode */}
      <div className="p-4 flex items-center justify-between border-b border-gray-800 portrait:flex landscape:hidden">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">Manager Time Clock</h1>
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
        <div className="w-full md:w-1/2 landscape:w-1/3 border-r border-gray-800 p-4 overflow-auto landscape:max-h-screen">
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
          
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {employees.map((employee) => (
                <div 
                  key={employee.id}
                  className={`cursor-pointer p-3 flex items-center rounded-lg transition-all ${
                    selectedEmployee === employee.id 
                      ? 'bg-gray-800 border border-teal-500' 
                      : 'hover:bg-gray-800'
                  }`}
                  onClick={() => handleSelectEmployee(employee.id)}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mr-3 overflow-hidden">
                    {employee.avatar ? (
                      <img src={employee.avatar} alt={employee.name} className="w-full h-full object-cover" />
                    ) : (
                      <UserCheck className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{employee.name}</h3>
                    <p className="text-sm text-gray-400">{employee.job_title || 'No title'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right side - Clock actions */}
        <div className="w-full md:w-1/2 landscape:w-2/3 p-4 flex flex-col items-center justify-center">
          {/* Company logo/header */}
          <div className="text-center mb-6">
            <div className="text-lg uppercase tracking-wider">TeamPulse</div>
            <p className="text-sm text-gray-400">{currentTime.toLocaleDateString()}</p>
          </div>
          
          {/* Large digital clock */}
          <div className="text-center mb-10">
            <h2 className="text-[10rem] font-mono leading-none">{formattedTime}</h2>
          </div>

          {selectedEmployee ? (
            <div className="w-full max-w-lg text-center">
              <h3 className="text-xl mb-2 font-semibold">{getSelectedEmployeeName()}</h3>
              <p className="text-gray-400 mb-8">Status: {getEmployeeStatus(selectedEmployee)}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  className={`py-6 text-3xl rounded-md ${action === 'in' ? 'animate-pulse' : ''}`}
                  style={{ backgroundColor: '#00A896' }}
                  onClick={() => handleClockAction('in')}
                >
                  IN
                </Button>
                <Button 
                  className={`py-6 text-3xl rounded-md ${action === 'out' ? 'animate-pulse' : ''}`}
                  style={{ backgroundColor: '#E63946' }}
                  onClick={() => handleClockAction('out')}
                >
                  OUT
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400">
              <h3 className="text-xl mb-4">No Employee Selected</h3>
              <p>Please select an employee from the list</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerTimeClock;
