
import { useState, useEffect } from "react";
import AttendanceHeader from "@/components/attendance/AttendanceHeader";
import AttendanceStats from "@/components/attendance/AttendanceStats";
import AttendanceControls from "@/components/attendance/AttendanceControls";
import AttendanceList from "@/components/attendance/AttendanceList";
import { useEmployeeDataManagement } from "@/hooks/use-employee-data-management";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";

const Attendance = () => {
  const { user, isManager, isAdmin, isHR, isPayroll } = useAuth();
  const { employeeData, isLoading } = useEmployeeDataManagement();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Add debugging
  console.log('Attendance page - Auth info:', { user: user?.id, isManager, isAdmin, isHR, isPayroll });
  console.log('Employee data:', employeeData);
  
  // For employees, always use their own employee ID
  // For managers/admins/payroll, allow selection of different employees but default to their own
  const canViewAllEmployees = isManager || isAdmin || isHR || isPayroll;
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>(
    // Default to their own employee ID for everyone initially
    employeeData?.id
  );

  // Sync selectedEmployeeId when employeeData loads
  useEffect(() => {
    if (employeeData?.id && !selectedEmployeeId) {
      setSelectedEmployeeId(employeeData.id);
    }
  }, [employeeData?.id, selectedEmployeeId]);

  // Determine if this user can view all employees or just their own data
  const effectiveEmployeeId = canViewAllEmployees ? selectedEmployeeId : employeeData?.id;
  
  console.log('Effective employee ID for attendance:', effectiveEmployeeId);
  console.log('Selected employee ID:', selectedEmployeeId);
  console.log('Can view all employees:', canViewAllEmployees);
  
  if (isLoading) {
    return (
      <div className="container max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading attendance data...</div>
        </div>
      </div>
    );
  }

  // For employees without proper employee data, show a message
  if (!canViewAllEmployees && !employeeData?.id) {
    console.log('Employee without proper employee data');
    return (
      <div className="container max-w-[1200px] mx-auto px-4 py-8">
        <AttendanceHeader />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Setting up your attendance profile
            </h3>
            <p className="text-gray-500">
              Your employee profile is being set up. Please contact your manager if this persists.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`${isMobile ? 'px-0 py-2' : 'container max-w-[1200px] mx-auto px-4 py-8'}`}>
      <div className={isMobile ? 'px-4' : ''}>
        <AttendanceHeader />
      </div>
      
      {/* Always show stats - even if effectiveEmployeeId is undefined, the component will handle it */}
      <div className={isMobile ? 'px-4' : ''}>
        <AttendanceStats employeeId={effectiveEmployeeId} />
      </div>
      
      {/* Only show controls for managers/admins who can view all employees */}
      {canViewAllEmployees && (
        <div className={isMobile ? 'px-4' : ''}>
          <AttendanceControls 
            onSearchChange={setSearchQuery}
            onEmployeeSelect={setSelectedEmployeeId}
            onDateChange={setSelectedDate}
          />
        </div>
      )}
      
      {/* Always show attendance list */}
      <div className={isMobile ? 'px-4' : ''}>
        <AttendanceList 
          employeeId={effectiveEmployeeId} 
          searchQuery={searchQuery}
          selectedDate={selectedDate}
        />
      </div>
    </div>
  );
};

export default Attendance;
