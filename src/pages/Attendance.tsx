
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
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>(
    employeeData?.id
  );

  // Determine if this user can view all employees or just their own data
  const canViewAllEmployees = isManager || isAdmin || isHR;
  
  // If not a manager/admin/HR, force the selection to be the current employee
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
  
  return (
    <div className="container max-w-[1200px] mx-auto px-4 py-8">
      <AttendanceHeader />
      <AttendanceStats employeeId={effectiveEmployeeId} />
      <AttendanceControls 
        onSearchChange={setSearchQuery}
        onEmployeeSelect={canViewAllEmployees ? setSelectedEmployeeId : undefined}
        onDateChange={setSelectedDate}
      />
      <AttendanceList 
        employeeId={effectiveEmployeeId} 
        searchQuery={searchQuery}
        selectedDate={selectedDate}
      />
    </div>
  );
};

export default Attendance;
