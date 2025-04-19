
import { useState } from "react";
import AttendanceHeader from "@/components/attendance/AttendanceHeader";
import AttendanceStats from "@/components/attendance/AttendanceStats";
import AttendanceControls from "@/components/attendance/AttendanceControls";
import AttendanceList from "@/components/attendance/AttendanceList";
import { useEmployeeDataManagement } from "@/hooks/use-employee-data-management";

const Attendance = () => {
  const { employeeData, isLoading } = useEmployeeDataManagement();
  const [searchQuery, setSearchQuery] = useState("");
  
  return (
    <div className="container max-w-[1200px] mx-auto px-4 py-8">
      <AttendanceHeader />
      <AttendanceStats employeeId={employeeData?.id} />
      <AttendanceControls onSearchChange={setSearchQuery} />
      <AttendanceList employeeId={employeeData?.id} searchQuery={searchQuery} />
    </div>
  );
};

export default Attendance;
