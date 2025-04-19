import { useAttendance } from "@/hooks/use-attendance";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

interface AttendanceListProps {
  employeeId?: string;
  searchQuery?: string;
}

const AttendanceList = ({ employeeId, searchQuery = "" }: AttendanceListProps) => {
  const { data: attendance, refetch } = useAttendance(employeeId);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleOvertimeApproval = async (recordId: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('attendance')
        .update({
          overtime_status: approved ? 'approved' : 'rejected',
          overtime_approved_by: user?.id,
          overtime_approved_at: new Date().toISOString()
        })
        .eq('id', recordId);

      if (error) throw error;

      toast({
        title: approved ? "Overtime Approved" : "Overtime Rejected",
        description: `The overtime request has been ${approved ? 'approved' : 'rejected'}.`,
        variant: approved ? "default" : "destructive",
      });

      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process overtime request.",
        variant: "destructive",
      });
    }
  };

  const formatDuration = (minutes: number | null | undefined) => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

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
      {filteredRecords?.map((record) => (
        <div key={record.id} className="border rounded-xl p-4 md:p-6 bg-white">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
            <div>
              <h3 className="font-semibold mb-1">
                {format(new Date(record.date || ""), "EEEE, dd")}
              </h3>
              <div className="flex flex-col md:flex-row gap-2 md:gap-6 text-gray-600 text-sm">
                <span>Clock-in: {record.check_in ? format(new Date(record.check_in), "hh:mm a") : "-"}</span>
                <span>Clock-out: {record.check_out ? format(new Date(record.check_out), "hh:mm a") : "-"}</span>
                <span>Working time: {formatDuration(record.working_minutes)}</span>
                {record.overtime_minutes && record.overtime_minutes > 0 && (
                  <span>Overtime: {formatDuration(record.overtime_minutes)}</span>
                )}
              </div>
            </div>
            {record.overtime_minutes && record.overtime_minutes > 0 && (
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
                {record.overtime_status === 'pending' ? (
                  <>
                    <Button 
                      variant="outline" 
                      className="text-red-600 border-red-200 bg-red-50"
                      onClick={() => handleOvertimeApproval(record.id, false)}
                    >
                      Reject Overtime
                    </Button>
                    <Button 
                      variant="default" 
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleOvertimeApproval(record.id, true)}
                    >
                      Approve Overtime
                    </Button>
                  </>
                ) : (
                  <span className={`px-2 py-1 text-sm rounded-full whitespace-nowrap
                    ${record.overtime_status === 'approved' 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                      : 'bg-red-50 text-red-600 border border-red-200'
                    }`}
                  >
                    Overtime {record.overtime_status}
                  </span>
                )}
              </div>
            )}
          </div>
          
          <div className="h-2 rounded-full bg-blue-500" />
        </div>
      ))}
    </div>
  );
};

export default AttendanceList;
