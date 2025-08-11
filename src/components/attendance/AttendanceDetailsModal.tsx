import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Clock,
  MapPin,
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  Eye,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAttendance } from "@/hooks/use-attendance";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/use-auth";
import { useEmployeeDataManagement } from "@/hooks/use-employee-data-management";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, isSameMonth, parseISO } from "date-fns";

interface AttendanceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId?: string;
  employeeName?: string;
}

const AttendanceDetailsModal = ({
  isOpen,
  onClose,
  employeeId,
  employeeName = "Employee"
}: AttendanceDetailsModalProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const isMobile = useIsMobile();
  const { isAdmin } = useAuth();
  const { employeeId: currentEmployeeId } = useEmployeeDataManagement();
  const effectiveEmployeeId = useMemo(() => {
    if (isAdmin) return employeeId ?? currentEmployeeId ?? undefined;
    return employeeId && currentEmployeeId && employeeId !== currentEmployeeId
      ? currentEmployeeId
      : (employeeId ?? currentEmployeeId ?? undefined);
  }, [isAdmin, employeeId, currentEmployeeId]);
  const effectiveEmployeeName = useMemo(() => {
    if (!isAdmin && employeeId && currentEmployeeId && employeeId !== currentEmployeeId) return "Your Attendance";
    return employeeName;
  }, [isAdmin, employeeId, currentEmployeeId, employeeName]);
  const { data: attendanceData, isLoading } = useAttendance(effectiveEmployeeId, selectedDate);
  const { toast } = useToast();
  // Use real attendance records from hook
  const records = attendanceData?.recentRecords || [];

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const monthRecords = records.filter(r => {
    if (!r.date) return false;
    // r.date is ISO date string (YYYY-MM-DD)
    const d = parseISO(String(r.date));
    return d >= monthStart && d <= monthEnd && isSameMonth(d, monthStart);
  });

  const presentCount = monthRecords.filter(r => r.attendance_status === 'Present').length;
  const totalMinutes = monthRecords.reduce((sum, r) => sum + (r.working_minutes || 0), 0);
  const overtimeMinutes = monthRecords.reduce((sum, r) => sum + (r.overtime_minutes || 0), 0);
  const attendanceRate = monthRecords.length > 0 ? Math.round((presentCount / monthRecords.length) * 100) : 0;

  const formatMinutes = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    return `${h}h ${m}m`;
  };

  const formatTime = (iso: string | null | undefined) => {
    if (!iso) return "-";
    try { return format(new Date(iso), "HH:mm"); } catch { return "-"; }
  };

  const derivedRecords = monthRecords.map(r => ({
    date: r.date || '',
    status: r.attendance_status || r.status || 'Pending',
    checkIn: formatTime(r.check_in),
    checkOut: formatTime(r.check_out),
    hoursWorked: formatMinutes(r.working_minutes || 0),
    overtime: formatMinutes(r.overtime_minutes || 0),
    location: r.location || '-',
    isLate: !!r.is_late,
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-800";
      case "Absent":
        return "bg-red-100 text-red-800";
      case "Late":
        return "bg-yellow-100 text-yellow-800";
      case "Pending":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const exportDetailedData = () => {
    const csvContent = "data:text/csv;charset=utf-8,Date,Status,Check In,Check Out,Hours Worked,Overtime,Location,Late\n";
    const dataRows = derivedRecords.map(record => 
      `${record.date},${record.status},${record.checkIn},${record.checkOut},${record.hoursWorked},${record.overtime},${record.location},${record.isLate ? "Yes" : "No"}`
    );
    const fullCsv = csvContent + dataRows.join('\n');
    const encodedUri = encodeURI(fullCsv);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `detailed_attendance_${(effectiveEmployeeName || "employee").replace(/\s+/g, "_")}_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportAllEmployeesMonth = async () => {
    try {
      if (!isAdmin) return;
      const from = format(monthStart, "yyyy-MM-dd");
      const to = format(monthEnd, "yyyy-MM-dd");
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          id, employee_id, date, check_in, check_out, working_minutes, overtime_minutes, attendance_status, location, is_late,
          employees:employee_id ( name )
        `)
        .gte('date', from)
        .lte('date', to)
        .order('date', { ascending: true });
      if (error) throw error;
      const header = 'Employee,Date,Status,Check In,Check Out,Working Minutes,Overtime Minutes,Late,Location\n';
      const rows = (data || []).map((r: any) => [
        r.employees?.name || '',
        r.date || '',
        r.attendance_status || r.status || 'Pending',
        formatTime(r.check_in),
        formatTime(r.check_out),
        String(r.working_minutes ?? 0),
        String(r.overtime_minutes ?? 0),
        r.is_late ? 'Yes' : 'No',
        r.location || ''
      ].join(','));
      const csv = header + rows.join('\n');
      const encodedUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `attendance_all_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: 'Export complete', description: `${rows.length} records exported for ${format(monthStart, 'MMM yyyy')}` });
    } catch (err: any) {
      console.error('Export all employees failed', err);
      toast({ title: 'Export failed', description: 'Could not export all employees for this month', variant: 'destructive' });
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${isMobile ? 'max-w-[95vw] h-[95vh] p-3' : 'max-w-6xl max-h-[90vh]'} overflow-y-auto`}>
        <DialogHeader className={isMobile ? 'pb-3' : ''}>
          <DialogTitle className={`flex items-center gap-2 ${isMobile ? 'text-lg' : ''}`}>
            <Eye className={isMobile ? 'h-4 w-4' : 'h-5 w-5'} />
            Attendance Details - {effectiveEmployeeName}
          </DialogTitle>
          <DialogDescription className={isMobile ? 'text-sm' : ''}>
            Comprehensive attendance overview and detailed records
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <div className={`flex ${isMobile ? 'flex-col gap-3' : 'justify-between items-center'} mb-4`}>
            <TabsList className={`grid w-full grid-cols-3 ${isMobile ? 'h-9' : ''}`}>
              <TabsTrigger value="overview" className={isMobile ? 'text-xs px-2' : ''}>Overview</TabsTrigger>
              <TabsTrigger value="records" className={isMobile ? 'text-xs px-2' : ''}>Daily Records</TabsTrigger>
              <TabsTrigger value="analytics" className={isMobile ? 'text-xs px-2' : ''}>Analytics</TabsTrigger>
            </TabsList>
            <Button onClick={exportDetailedData} variant="outline" size={isMobile ? 'sm' : 'sm'} className={isMobile ? 'w-full' : ''}>
              <Download className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
              {isMobile ? 'Export' : 'Export Details'}
            </Button>
          </div>

          <TabsContent value="overview" className={isMobile ? 'space-y-4' : 'space-y-6'}>
            {/* Summary Stats */}
            <div className={`grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-2 md:grid-cols-4 gap-4'}`}>
              <Card>
                <CardHeader className={isMobile ? 'pb-1 px-3 pt-3' : 'pb-2'}>
                  <CardTitle className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>This Month</CardTitle>
                </CardHeader>
                <CardContent className={isMobile ? 'px-3 pb-3' : ''}>
                  <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>{presentCount}</div>
                  <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-green-600 flex items-center`}>
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {/* Placeholder delta until comparative data added */}
                    +0 vs last month
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className={isMobile ? 'pb-1 px-3 pt-3' : 'pb-2'}>
                  <CardTitle className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>Total Hours</CardTitle>
                </CardHeader>
                <CardContent className={isMobile ? 'px-3 pb-3' : ''}>
                  <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>{formatMinutes(totalMinutes)}</div>
                  <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-green-600 flex items-center`}>
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +0h vs last month
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className={isMobile ? 'pb-1 px-3 pt-3' : 'pb-2'}>
                  <CardTitle className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>Overtime</CardTitle>
                </CardHeader>
                <CardContent className={isMobile ? 'px-3 pb-3' : ''}>
                  <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>{formatMinutes(overtimeMinutes)}</div>
                  <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-red-600 flex items-center`}>
                    <TrendingDown className="h-3 w-3 mr-1" />
                    -0h vs last month
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className={isMobile ? 'pb-1 px-3 pt-3' : 'pb-2'}>
                  <CardTitle className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>Attendance Rate</CardTitle>
                </CardHeader>
                <CardContent className={isMobile ? 'px-3 pb-3' : ''}>
                  <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>{attendanceRate}%</div>
                  <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-600 flex items-center`}>
                    <Minus className="h-3 w-3 mr-1" />
                    Same as last month
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader className={isMobile ? 'px-3 py-3' : ''}>
                <CardTitle className={isMobile ? 'text-base' : ''}>Recent Activity</CardTitle>
                <CardDescription className={isMobile ? 'text-sm' : ''}>Last 7 days attendance summary</CardDescription>
              </CardHeader>
              <CardContent className={isMobile ? 'px-3 pb-3' : ''}>
                <div className={isMobile ? 'space-y-2' : 'space-y-3'}>
                  {derivedRecords.slice(0, 4).map((record, index) => (
                    <div key={index} className={`${isMobile ? 'flex flex-col gap-2 p-2' : 'flex items-center justify-between p-3'} bg-gray-50 rounded-lg`}>
                      <div className={`flex items-center ${isMobile ? 'justify-between' : 'gap-3'}`}>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-gray-500" />
                          <span className={`font-medium ${isMobile ? 'text-sm' : ''}`}>{record.date}</span>
                        </div>
                        <div className="flex gap-1">
                          <Badge className={`${getStatusColor(record.status)} ${isMobile ? 'text-xs px-2 py-0.5' : ''}`}>
                            {record.status}
                          </Badge>
                          {record.isLate && (
                            <Badge variant="outline" className={`text-yellow-600 border-yellow-300 ${isMobile ? 'text-xs px-2 py-0.5' : ''}`}>
                              Late
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className={`flex items-center ${isMobile ? 'justify-between text-xs' : 'gap-4 text-sm'} text-gray-600`}>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {record.checkIn} - {record.checkOut}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {record.location}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="records" className={isMobile ? 'space-y-3' : 'space-y-4'}>
            <div className={`${isMobile ? 'flex flex-col gap-4' : 'grid md:grid-cols-3 gap-6'}`}>
              <div className={isMobile ? 'order-2' : 'md:col-span-1'}>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className={`rounded-md border ${isMobile ? 'w-full' : ''}`}
                />
              </div>
              
              <div className={`${isMobile ? 'order-1' : 'md:col-span-2'}`}>
                <Card>
                  <CardHeader className={isMobile ? 'px-3 py-3' : ''}>
                    <CardTitle className={isMobile ? 'text-base' : ''}>Daily Records</CardTitle>
                    <CardDescription className={isMobile ? 'text-sm' : ''}>Detailed attendance records with timestamps</CardDescription>
                  </CardHeader>
                  <CardContent className={isMobile ? 'px-3 pb-3' : ''}>
                    <div className={isMobile ? 'space-y-2' : 'space-y-3'}>
                      {derivedRecords.map((record, index) => (
                        <div key={index} className={`border rounded-lg ${isMobile ? 'p-3' : 'p-4'}`}>
                          <div className={`flex justify-between items-start ${isMobile ? 'mb-2' : 'mb-3'}`}>
                            <div className="flex items-center gap-2">
                              <h4 className={`font-medium ${isMobile ? 'text-sm' : ''}`}>{record.date}</h4>
                              <Badge className={`${getStatusColor(record.status)} ${isMobile ? 'text-xs px-2 py-0.5' : ''}`}>
                                {record.status}
                              </Badge>
                            </div>
                            <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500`}>
                              {record.hoursWorked}
                            </div>
                          </div>
                          <div className={`grid grid-cols-2 ${isMobile ? 'gap-2 text-xs' : 'gap-4 text-sm'}`}>
                            <div>
                              <span className="text-gray-500">Check In:</span>
                              <span className="ml-2 font-medium">{record.checkIn}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Check Out:</span>
                              <span className="ml-2 font-medium">{record.checkOut}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Overtime:</span>
                              <span className="ml-2 font-medium">{record.overtime}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Location:</span>
                              <span className="ml-2 font-medium">{record.location}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className={isMobile ? 'space-y-3' : 'space-y-6'}>
            <div className={`${isMobile ? 'flex flex-col gap-4' : 'grid md:grid-cols-2 gap-6'}`}>
              <Card>
                <CardHeader className={isMobile ? 'px-3 py-3' : ''}>
                  <CardTitle className={isMobile ? 'text-base' : ''}>Monthly Trends</CardTitle>
                  <CardDescription className={isMobile ? 'text-sm' : ''}>Attendance patterns over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent className={isMobile ? 'px-3 pb-3' : ''}>
                  <div className={isMobile ? 'space-y-2' : 'space-y-4'}>
                    {[
                      { month: "July 2025", attendance: 95, hours: 168 },
                      { month: "June 2025", attendance: 98, hours: 175 },
                      { month: "May 2025", attendance: 92, hours: 162 },
                      { month: "April 2025", attendance: 96, hours: 170 },
                    ].map((data, index) => (
                      <div key={index} className={`flex justify-between items-center ${isMobile ? 'p-2' : 'p-3'} bg-gray-50 rounded-lg`}>
                        <span className={`font-medium ${isMobile ? 'text-sm' : ''}`}>{data.month}</span>
                        <div className={`flex ${isMobile ? 'gap-2 text-xs' : 'gap-4 text-sm'}`}>
                          <span>{data.attendance}% attendance</span>
                          <span>{data.hours}h total</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className={isMobile ? 'px-3 py-3' : ''}>
                  <CardTitle className={isMobile ? 'text-base' : ''}>Performance Insights</CardTitle>
                  <CardDescription className={isMobile ? 'text-sm' : ''}>Key attendance metrics and recommendations</CardDescription>
                </CardHeader>
                <CardContent className={isMobile ? 'px-3 pb-3' : ''}>
                  <div className={isMobile ? 'space-y-2' : 'space-y-4'}>
                    <div className={`${isMobile ? 'p-2' : 'p-3'} bg-green-50 border border-green-200 rounded-lg`}>
                      <h4 className={`font-medium text-green-800 mb-1 ${isMobile ? 'text-sm' : ''}`}>Excellent Attendance</h4>
                      <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-green-600`}>Consistently above 90% attendance rate</p>
                    </div>
                    
                    <div className={`${isMobile ? 'p-2' : 'p-3'} bg-blue-50 border border-blue-200 rounded-lg`}>
                      <h4 className={`font-medium text-blue-800 mb-1 ${isMobile ? 'text-sm' : ''}`}>Punctuality</h4>
                      <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-blue-600`}>Average check-in time: 8:58 AM</p>
                    </div>
                    
                    <div className={`${isMobile ? 'p-2' : 'p-3'} bg-orange-50 border border-orange-200 rounded-lg`}>
                      <h4 className={`font-medium text-orange-800 mb-1 ${isMobile ? 'text-sm' : ''}`}>Overtime Trend</h4>
                      <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-orange-600`}>2.5 hours this month (within limits)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className={`flex justify-end gap-2 pt-4 border-t ${isMobile ? 'px-3' : ''}`}>
          <Button variant="outline" onClick={onClose} className={isMobile ? 'w-full' : ''}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AttendanceDetailsModal;