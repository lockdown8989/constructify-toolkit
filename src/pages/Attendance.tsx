
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import AttendanceHeader from "@/components/attendance/AttendanceHeader";
import AttendanceStats from "@/components/attendance/AttendanceStats";
import AttendanceControls from "@/components/attendance/AttendanceControls";
import AttendanceList from "@/components/attendance/AttendanceList";
import { useEmployeeDataManagement } from "@/hooks/use-employee-data-management";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

const Attendance = () => {
  const { employeeData, isLoading: isEmployeeLoading } = useEmployeeDataManagement();
  const { isManager, isAdmin, isHR } = useAuth();
  const location = useLocation();

  // Check if coming from "View Stats" as self (i.e., "?me=1")
  const searchParams = new URLSearchParams(location.search);
  const showSelfAttendance = searchParams.get("me") === "1";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>();

  const canManageAttendance = isManager || isAdmin || isHR;

  useEffect(() => {
    if (employeeData?.id) {
      if (showSelfAttendance) {
        setSelectedEmployeeId(employeeData.id);
      } else if (!selectedEmployeeId) {
        setSelectedEmployeeId(employeeData.id);
      }
    }
  }, [employeeData, selectedEmployeeId, showSelfAttendance]);

  // Do NOT allow selector to change for regular employees if they came via "View Stats"
  const lockToSelf = showSelfAttendance && !canManageAttendance;

  if (isEmployeeLoading && !selectedEmployeeId) {
    return (
      <div className="container max-w-[1200px] mx-auto px-4 py-8 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-600">Loading your attendance data...</span>
      </div>
    );
  }
  
  return (
    <div className="container max-w-[1200px] mx-auto px-4 py-8">
      <AttendanceHeader />
      <AttendanceStats employeeId={selectedEmployeeId} />
      {canManageAttendance ? (
        <AttendanceControls 
          onSearchChange={setSearchQuery}
          onEmployeeSelect={setSelectedEmployeeId}
          onDateChange={setSelectedDate}
        />
      ) : lockToSelf ? (
        // Hide controls completely for employees locked to self
        <div className="mb-8" />
      ) : (
        // Add a spacer for layout consistency
        <div className="mb-8" />
      )}
      <AttendanceList 
        employeeId={selectedEmployeeId} 
        searchQuery={searchQuery}
        selectedDate={selectedDate}
      />
    </div>
  );
};

export default Attendance;
