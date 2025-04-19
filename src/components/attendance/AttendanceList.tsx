import { useAttendance } from "@/hooks/use-attendance";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface AttendanceListProps {
  employeeId?: string;
  searchQuery?: string;
}

const AttendanceList = ({ employeeId, searchQuery = "" }: AttendanceListProps) => {
  const { data: attendance } = useAttendance(employeeId);
  const isMobile = useIsMobile();

  const workingTimeData = {
    clockIn: "09:00 AM",
    clockOut: "09:12 PM",
    duration: "10h 12m",
    timeline: [
      { type: "working", start: "09:00", end: "12:10", duration: "3h 10m", color: "bg-blue-500" },
      { type: "break", start: "12:10", end: "13:00", color: "bg-emerald-400" },
      { type: "working", start: "13:00", end: "17:00", color: "bg-blue-500" },
      { type: "overtime", start: "17:00", end: "21:00", color: "bg-orange-500" }
    ]
  };

  const calculateSegmentWidth = (segment: typeof workingTimeData.timeline[0]) => {
    const startMinutes = getMinutesFromTime(segment.start);
    const endMinutes = getMinutesFromTime(segment.end);
    const totalDayMinutes = 12 * 60; // 12 hours displayed
    return ((endMinutes - startMinutes) / totalDayMinutes) * 100;
  };

  const getMinutesFromTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const filteredRecords = attendance?.recentRecords?.filter(record => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      (record.employee_id?.toLowerCase().includes(searchLower) || false) ||
      (record.employee_name?.toLowerCase().includes(searchLower) || false)
    );
  });

  return (
    <div className="space-y-6">
      <div className="border rounded-xl p-4 md:p-6 bg-white">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="font-semibold mb-1">Today</h3>
            <div className="flex flex-col md:flex-row gap-2 md:gap-6 text-gray-600 text-sm">
              <span>Clock-in: {workingTimeData.clockIn}</span>
              <span>Clock-out: {workingTimeData.clockOut}</span>
              <span>Duration: {workingTimeData.duration}</span>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
            <Button variant="outline" className="text-red-600 border-red-200 bg-red-50">
              Overtime approval
            </Button>
            <Button variant="default" className="bg-emerald-600 hover:bg-emerald-700">
              Approve
            </Button>
          </div>
        </div>
        
        <div className="relative mt-8">
          <div className="absolute -left-2 md:-left-4 text-sm text-gray-500 top-1/2 -translate-y-1/2">
            Working time
          </div>
          <div className="h-8 flex ml-16 md:ml-20 rounded-full overflow-hidden bg-gray-100">
            {workingTimeData.timeline.map((segment, index) => (
              <div
                key={index}
                className={`${segment.color} relative group`}
                style={{ width: `${calculateSegmentWidth(segment)}%` }}
              >
                <div className="hidden group-hover:block absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                  {segment.start} - {segment.end}
                  {segment.duration && ` (${segment.duration})`}
                </div>
              </div>
            ))}
          </div>
          <div className="ml-16 md:ml-20 mt-2 flex justify-between text-xs text-gray-500">
            <span>09:00</span>
            <span>21:00</span>
          </div>
        </div>
      </div>

      {filteredRecords?.map((record) => (
        <div key={record.id} className="border rounded-xl p-4 md:p-6 bg-white">
          <div className="flex flex-col md:flex-row justify-between items-start gap-3 mb-4">
            <div>
              <h3 className="font-semibold mb-1">
                {format(new Date(record.date || ""), "EEEE, dd")}
              </h3>
              <div className="flex flex-col md:flex-row gap-2 md:gap-6 text-gray-600 text-sm">
                <span>Clock-in: {record.check_in ? format(new Date(record.check_in), "hh:mm a") : "-"}</span>
                <span>Clock-out: {record.check_out ? format(new Date(record.check_out), "hh:mm a") : "-"}</span>
                <span>Duration: 8 hours</span>
              </div>
            </div>
            {record.status === "Approved" && (
              <span className="px-2 py-1 text-sm rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 whitespace-nowrap">
                Approved
              </span>
            )}
          </div>
          
          <div className="h-2 rounded-full bg-blue-500" />
        </div>
      ))}
    </div>
  );
};

export default AttendanceList;
