
import { useAttendance } from "@/hooks/use-attendance";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

const AttendanceList = () => {
  const { data: attendance } = useAttendance();

  const workingTimeData = {
    clockIn: "09:00 AM",
    clockOut: "09:12 PM",
    duration: "10h 12m",
    timeline: [
      { type: "working", start: "09:00", end: "12:10", duration: "3h 10m" },
      { type: "break", start: "12:10", end: "13:00" },
      { type: "working", start: "13:00", end: "17:00" },
      { type: "overtime", start: "17:00", end: "21:00" },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="border rounded-xl p-6 bg-white">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold mb-1">Today</h3>
            <div className="flex gap-6 text-gray-600 text-sm">
              <span>Clock-in: {workingTimeData.clockIn}</span>
              <span>Clock-out: {workingTimeData.clockOut}</span>
              <span>Duration: {workingTimeData.duration}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="text-red-600 border-red-200 bg-red-50">
              Overtime approval
            </Button>
            <Button variant="default" className="bg-emerald-600 hover:bg-emerald-700">
              Approve
            </Button>
          </div>
        </div>
        
        <div className="relative">
          <div className="absolute -left-4 text-sm text-gray-500">
            Working time
          </div>
          <div className="h-8 flex rounded-full overflow-hidden mt-6">
            {workingTimeData.timeline.map((segment, index) => (
              <div 
                key={index}
                className={`
                  ${segment.type === "working" ? "bg-blue-500" : 
                    segment.type === "break" ? "bg-emerald-400" : 
                    "bg-orange-500"}
                  flex-grow
                `}
              />
            ))}
          </div>
        </div>
      </div>

      {attendance?.recentRecords.map((record) => (
        <div key={record.id} className="border rounded-xl p-6 bg-white">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-semibold mb-1">
                {format(new Date(record.date || ""), "EEEE, dd")}
              </h3>
              <div className="flex gap-6 text-gray-600 text-sm">
                <span>Clock-in: {format(new Date(record.check_in || ""), "hh:mm a")}</span>
                <span>Clock-out: {record.check_out ? format(new Date(record.check_out), "hh:mm a") : "-"}</span>
                <span>Duration: 8 hours</span>
              </div>
            </div>
            {record.status === "approved" && (
              <span className="px-2 py-1 text-sm rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
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
