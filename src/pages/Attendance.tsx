
import { useState } from "react";
import AttendanceHeader from "@/components/attendance/AttendanceHeader";
import AttendanceStats from "@/components/attendance/AttendanceStats";
import AttendanceControls from "@/components/attendance/AttendanceControls";
import AttendanceList from "@/components/attendance/AttendanceList";
import { useEmployeeDataManagement } from "@/hooks/use-employee-data-management";

const Attendance = () => {
  const { employeeData, isLoading } = useEmployeeDataManagement();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>(
    employeeData?.id
  );
  
  return (
    <div className="container max-w-[1200px] mx-auto px-4 py-8">
      <AttendanceHeader />
      <AttendanceStats employeeId={selectedEmployeeId} />
      <AttendanceControls 
        onSearchChange={setSearchQuery}
        onEmployeeSelect={setSelectedEmployeeId}
        onDateChange={setSelectedDate}
      />
      <AttendanceList 
        employeeId={selectedEmployeeId} 
        searchQuery={searchQuery}
        selectedDate={selectedDate}
      />
    </div>
  );
};

export default Attendance;
