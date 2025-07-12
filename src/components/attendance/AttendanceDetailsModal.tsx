import { useState } from "react";
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
import { useAttendance } from "@/hooks/use-attendance";
import { format } from "date-fns";

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
  const { data: attendanceData, isLoading } = useAttendance(employeeId, selectedDate);

  // Mock detailed attendance data - in real app, this would come from API
  const attendanceRecords = [
    {
      date: "2025-07-12",
      status: "Present",
      checkIn: "08:55",
      checkOut: "17:45",
      hoursWorked: "8h 50m",
      overtime: "0h 20m",
      location: "Main Office",
      isLate: false,
    },
    {
      date: "2025-07-11",
      status: "Present",
      checkIn: "09:10",
      checkOut: "17:30",
      hoursWorked: "8h 20m",
      overtime: "0h 0m",
      location: "Main Office",
      isLate: true,
    },
    {
      date: "2025-07-10",
      status: "Present",
      checkIn: "08:45",
      checkOut: "18:00",
      hoursWorked: "9h 15m",
      overtime: "1h 15m",
      location: "Main Office",
      isLate: false,
    },
    {
      date: "2025-07-09",
      status: "Absent",
      checkIn: "-",
      checkOut: "-",
      hoursWorked: "0h 0m",
      overtime: "0h 0m",
      location: "-",
      isLate: false,
    },
  ];

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
    const dataRows = attendanceRecords.map(record => 
      `${record.date},${record.status},${record.checkIn},${record.checkOut},${record.hoursWorked},${record.overtime},${record.location},${record.isLate ? "Yes" : "No"}`
    );
    
    const fullCsv = csvContent + dataRows.join('\n');
    const encodedUri = encodeURI(fullCsv);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `detailed_attendance_${employeeName?.replace(" ", "_")}_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Attendance Details - {employeeName}
          </DialogTitle>
          <DialogDescription>
            Comprehensive attendance overview and detailed records
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList className="grid w-fit grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="records">Daily Records</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            <Button onClick={exportDetailedData} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Details
            </Button>
          </div>

          <TabsContent value="overview" className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-600">This Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{attendanceData?.present || 1}</div>
                  <div className="text-xs text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +1 vs last month
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-600">Total Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">42.5h</div>
                  <div className="text-xs text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +5.2h vs last month
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-600">Overtime</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2.5h</div>
                  <div className="text-xs text-red-600 flex items-center">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    -1.2h vs last month
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-600">Attendance Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">95%</div>
                  <div className="text-xs text-gray-600 flex items-center">
                    <Minus className="h-3 w-3 mr-1" />
                    Same as last month
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Last 7 days attendance summary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {attendanceRecords.slice(0, 4).map((record, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{record.date}</span>
                        </div>
                        <Badge className={getStatusColor(record.status)}>
                          {record.status}
                        </Badge>
                        {record.isLate && (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                            Late
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
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

          <TabsContent value="records" className="space-y-4">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border"
                />
              </div>
              
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Records</CardTitle>
                    <CardDescription>Detailed attendance records with timestamps</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {attendanceRecords.map((record, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{record.date}</h4>
                              <Badge className={getStatusColor(record.status)}>
                                {record.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-500">
                              {record.hoursWorked}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
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

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Trends</CardTitle>
                  <CardDescription>Attendance patterns over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { month: "July 2025", attendance: 95, hours: 168 },
                      { month: "June 2025", attendance: 98, hours: 175 },
                      { month: "May 2025", attendance: 92, hours: 162 },
                      { month: "April 2025", attendance: 96, hours: 170 },
                    ].map((data, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">{data.month}</span>
                        <div className="flex gap-4 text-sm">
                          <span>{data.attendance}% attendance</span>
                          <span>{data.hours}h total</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Insights</CardTitle>
                  <CardDescription>Key attendance metrics and recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-1">Excellent Attendance</h4>
                      <p className="text-sm text-green-600">Consistently above 90% attendance rate</p>
                    </div>
                    
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-1">Punctuality</h4>
                      <p className="text-sm text-blue-600">Average check-in time: 8:58 AM</p>
                    </div>
                    
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <h4 className="font-medium text-orange-800 mb-1">Overtime Trend</h4>
                      <p className="text-sm text-orange-600">2.5 hours this month (within limits)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AttendanceDetailsModal;