import { useAttendance } from "@/hooks/use-attendance";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Clock, MapPin, Monitor, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AttendanceListProps {
  employeeId?: string;
  searchQuery?: string;
  selectedDate?: Date;
}

const AttendanceList = ({ employeeId, searchQuery = "", selectedDate = new Date() }: AttendanceListProps) => {
  const { data: attendance, refetch } = useAttendance(employeeId, selectedDate);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { user, isManager } = useAuth();

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

  const calculateSegmentWidth = (segment: any) => {
    const startMinutes = getMinutesFromTime(segment.start);
    const endMinutes = getMinutesFromTime(segment.end);
    const totalDayMinutes = 12 * 60; // 12 hours displayed
    return ((endMinutes - startMinutes) / totalDayMinutes) * 100;
  };

  const getMinutesFromTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const filterRecords = () => {
    if (!attendance?.recentRecords) return [];

    return attendance.recentRecords.filter(record => {
      if (!searchQuery) return true;
      const searchLower = searchQuery.toLowerCase();
      return (
        (record.employee_id?.toLowerCase().includes(searchLower) || false) ||
        (record.employee_name?.toLowerCase().includes(searchLower) || false) ||
        (record.status?.toLowerCase().includes(searchLower) || false)
      );
    });
  };

  const filteredRecords = filterRecords();

  return (
    <div className="space-y-6">
      {filteredRecords.length === 0 ? (
        <Card className="border rounded-xl p-4 md:p-6 bg-white">
          <CardContent className="flex flex-col items-center justify-center pt-6 pb-10">
            <Clock className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium mb-2">No attendance records found</h3>
            <p className="text-gray-500 text-center">
              {searchQuery 
                ? "Try adjusting your search query" 
                : "No attendance records available for the selected employee"}
            </p>
          </CardContent>
        </Card>
      ) : (
        filteredRecords.map((record) => (
          <div key={record.id} className="border rounded-xl p-4 md:p-6 bg-white">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
              <div>
                <h3 className="font-semibold mb-1">
                  {format(new Date(record.date || ""), "EEEE, MMMM dd, yyyy")}
                </h3>
                <div className="flex flex-col md:flex-row gap-2 md:gap-6 text-gray-600 text-sm">
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-blue-500" />
                    Clock-in: {record.check_in ? format(new Date(record.check_in), "hh:mm a") : "-"}
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-red-500" />
                    Clock-out: {record.check_out ? format(new Date(record.check_out), "hh:mm a") : "-"}
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-green-500" />
                    Working time: {formatDuration(record.working_minutes)}
                  </span>
                  {record.break_minutes && record.break_minutes > 0 && (
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-orange-500" />
                      Break time: {formatDuration(record.break_minutes)}
                    </span>
                  )}
                </div>
                
                {/* Location and device info */}
                <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
                  {record.location && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                            <MapPin className="h-3 w-3" />
                            Location data available
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs break-all">{record.location}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  
                  {record.device_info && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                            <Monitor className="h-3 w-3" />
                            Device info available
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs break-all">{record.device_info}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  
                  {record.notes && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                            <FileText className="h-3 w-3" />
                            Notes available
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs break-all">{record.notes}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
              
              {isManager && record.overtime_minutes && record.overtime_minutes > 0 && (
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
                  {record.overtime_status === 'pending' ? (
                    <>
                      <Button 
                        variant="outline" 
                        className="text-red-600 border-red-200 bg-red-50 hover:bg-red-100"
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
                    <span className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap font-medium
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
            
            {/* Timeline visualization */}
            <div className="mt-4">
              <div className="h-6 rounded-full bg-gray-100 overflow-hidden flex">
                {record.check_in && (
                  <>
                    <div className="bg-blue-500 h-full" style={{ 
                      width: record.working_minutes 
                        ? `${Math.min((record.working_minutes / (12 * 60)) * 100, 100)}%` 
                        : '0%' 
                    }}></div>
                    {record.break_minutes && record.break_minutes > 0 && (
                      <div className="bg-orange-400 h-full" style={{ 
                        width: `${Math.min((record.break_minutes / (12 * 60)) * 100, 20)}%` 
                      }}></div>
                    )}
                    {record.overtime_minutes && record.overtime_minutes > 0 && (
                      <div className={`h-full ${record.overtime_status === 'approved' ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ 
                        width: `${Math.min((record.overtime_minutes / (12 * 60)) * 100, 20)}%` 
                      }}></div>
                    )}
                  </>
                )}
              </div>
              
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>
                  {record.check_in ? format(new Date(record.check_in), "hh:mm a") : "--:--"}
                </span>
                <span>
                  {record.check_out ? format(new Date(record.check_out), "hh:mm a") : "--:--"}
                </span>
              </div>
            </div>
            
            {/* Status badges */}
            <div className="mt-3 flex flex-wrap gap-2">
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                record.status === 'Present' ? 'bg-green-100 text-green-800' :
                record.status === 'Auto-logout' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {record.status}
              </span>
              
              {record.overtime_minutes && record.overtime_minutes > 0 && (
                <span className="bg-orange-100 text-orange-800 px-2 py-0.5 text-xs rounded-full">
                  Overtime: {formatDuration(record.overtime_minutes)}
                </span>
              )}
              
              {record.check_in && new Date(record.check_in).getHours() >= 9 && (
                <span className="bg-red-100 text-red-800 px-2 py-0.5 text-xs rounded-full">
                  Late arrival
                </span>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AttendanceList;
