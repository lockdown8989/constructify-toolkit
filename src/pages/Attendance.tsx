
import { useState } from "react";
import AttendanceHeader from "@/components/attendance/AttendanceHeader";
import AttendanceStats from "@/components/attendance/AttendanceStats";
import AttendanceControls from "@/components/attendance/AttendanceControls";
import AttendanceList from "@/components/attendance/AttendanceList";
import { useEmployeeDataManagement } from "@/hooks/use-employee-data-management";
import { useAuth } from "@/hooks/use-auth";

const Attendance = () => {
  const { user, isManager, isAdmin, isHR } = useAuth();
  const { employeeData, isLoading } = useEmployeeDataManagement();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // For employees, always use their own employee ID
  // For managers/admins, allow selection of different employees
  const canViewAllEmployees = isManager || isAdmin || isHR;
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>(
    canViewAllEmployees ? undefined : employeeData?.id
  );

  // Determine if this user can view all employees or just their own data
  const effectiveEmployeeId = canViewAllEmployees ? selectedEmployeeId : employeeData?.id;
  
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
    <div className="container max-w-[1200px] mx-auto px-4 py-8">
      <AttendanceHeader />
      <AttendanceStats employeeId={effectiveEmployeeId} />
      
      {/* Only show controls for managers/admins who can view all employees */}
      {canViewAllEmployees && (
        <AttendanceControls 
          onSearchChange={setSearchQuery}
          onEmployeeSelect={setSelectedEmployeeId}
          onDateChange={setSelectedDate}
        />
      )}
      
      <AttendanceList 
        employeeId={effectiveEmployeeId} 
        searchQuery={searchQuery}
        selectedDate={selectedDate}
      />
    </div>
  );
};

export default Attendance;
