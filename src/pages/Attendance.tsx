
import AttendanceHeader from "@/components/attendance/AttendanceHeader";
import AttendanceStats from "@/components/attendance/AttendanceStats";
import AttendanceControls from "@/components/attendance/AttendanceControls";
import AttendanceList from "@/components/attendance/AttendanceList";

const Attendance = () => {
  return (
    <div className="container max-w-[1200px] mx-auto px-4 py-8">
      <AttendanceHeader />
      <AttendanceStats />
      <AttendanceControls />
      <AttendanceList />
    </div>
  );
};

export default Attendance;
