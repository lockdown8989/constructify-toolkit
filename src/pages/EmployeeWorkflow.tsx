
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useEmployeeDataManagement } from '@/hooks/use-employee-data-management'; 
import { recordClockIn, recordClockOut } from '@/services/employee-sync/attendance-sync';
import { useEmployeeLeave } from '@/hooks/use-employee-leave';
import { checkLeaveBalance, processLeaveRequest } from '@/services/employee-sync/leave-sync';
import { useAttendance } from '@/hooks/use-attendance';
import { useEmployeeSchedule } from '@/hooks/use-employee-schedule';
import { Loader2, CheckCircle, Clock, CalendarDays, DollarSign, ClipboardList } from "lucide-react";

const EmployeeWorkflow: React.FC = () => {
  const { toast } = useToast();
  const { employeeData, isLoading: isLoadingEmployee, employeeId } = useEmployeeDataManagement();
  const [activeTab, setActiveTab] = useState("attendance");
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasActiveSession, setHasActiveSession] = useState(false);
  
  // Get employee attendance data
  const { data: attendanceData, isLoading: isLoadingAttendance } = 
    useAttendance(employeeId, new Date());
    
  // Get employee leave data
  const { data: leaveData, isLoading: isLoadingLeave } = useEmployeeLeave(employeeId);
  
  // Get employee schedule
  const { 
    schedules, 
    isLoading: isLoadingSchedule, 
    activeTab: scheduleTab,
    setActiveTab: setScheduleTab,
    newSchedules
  } = useEmployeeSchedule();
  
  // Check if employee has an active session
  useEffect(() => {
    if (attendanceData?.recentRecords && attendanceData.recentRecords.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const todayRecord = attendanceData.recentRecords.find(
        record => record.date === today
      );
      
      setHasActiveSession(todayRecord?.active_session || false);
    }
  }, [attendanceData]);
  
  // Handle clock in
  const handleClockIn = async () => {
    if (!employeeId) return;
    
    setIsProcessing(true);
    try {
      const result = await recordClockIn(employeeId);
      
      if (result.success) {
        setHasActiveSession(true);
        toast({
          title: "Clock In Successful",
          description: "You have successfully clocked in for today.",
        });
      }
    } catch (error) {
      console.error('Error clocking in:', error);
      toast({
        title: "Clock In Failed",
        description: "Unable to clock in. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle clock out
  const handleClockOut = async () => {
    if (!employeeId) return;
    
    setIsProcessing(true);
    try {
      const result = await recordClockOut(employeeId);
      
      if (result.success) {
        setHasActiveSession(false);
        toast({
          title: "Clock Out Successful",
          description: "You have successfully clocked out for today.",
        });
      }
    } catch (error) {
      console.error('Error clocking out:', error);
      toast({
        title: "Clock Out Failed",
        description: "Unable to clock out. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const isLoading = isLoadingEmployee || isLoadingAttendance || isLoadingLeave || isLoadingSchedule;
  
  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your data...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Employee Overview */}
        <div className="col-span-1">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                My Overview
              </CardTitle>
              <CardDescription>
                Your attendance and schedule summary
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center py-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm text-muted-foreground mb-1">Present Days</p>
                  <p className="text-2xl font-bold text-blue-600">{attendanceData?.present || 0}</p>
                </div>
                <div className="text-center py-3 bg-amber-50 rounded-lg border border-amber-100">
                  <p className="text-sm text-muted-foreground mb-1">Leave Days</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {leaveData ? (leaveData.totalAnnualLeave - leaveData.annual_leave_days) : 0}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Today's Status</h4>
                {hasActiveSession ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Currently clocked in</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Not clocked in</span>
                  </div>
                )}
              </div>
              
              {/* Clock In/Out Actions */}
              <div className="mt-6">
                <h4 className="font-medium text-sm mb-2">Time Tracking</h4>
                {hasActiveSession ? (
                  <Button 
                    onClick={handleClockOut} 
                    className="w-full" 
                    variant="destructive"
                    disabled={isProcessing}
                  >
                    {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Clock Out
                  </Button>
                ) : (
                  <Button 
                    onClick={handleClockIn} 
                    className="w-full"
                    disabled={isProcessing}
                  >
                    {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Clock In
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                My Leave Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">Annual Leave</span>
                    <span className="text-sm font-medium">
                      {leaveData?.annual_leave_days || 0} / {leaveData?.totalAnnualLeave || 30} days
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-500 h-2.5 rounded-full" 
                      style={{ width: `${leaveData ? (leaveData.annual_leave_days / leaveData.totalAnnualLeave) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">Sick Leave</span>
                    <span className="text-sm font-medium">
                      {leaveData?.sick_leave_days || 0} / {leaveData?.totalSickLeave || 15} days
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-green-500 h-2.5 rounded-full" 
                      style={{ width: `${leaveData ? (leaveData.sick_leave_days / leaveData.totalSickLeave) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full">
                  Request Leave
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column - Workflow Tabs */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <Tabs defaultValue="attendance" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 mb-2">
                  <TabsTrigger value="attendance">Attendance</TabsTrigger>
                  <TabsTrigger value="shifts">My Shifts</TabsTrigger>
                  <TabsTrigger value="payslips">Payslips</TabsTrigger>
                </TabsList>
                
                <TabsContent value="attendance" className="mt-0">
                  <CardTitle>Attendance Summary</CardTitle>
                  <CardDescription>Your attendance records for this month</CardDescription>
                </TabsContent>
                
                <TabsContent value="shifts" className="mt-0">
                  <CardTitle>My Scheduled Shifts</CardTitle>
                  <CardDescription>Your upcoming and pending shifts</CardDescription>
                </TabsContent>
                
                <TabsContent value="payslips" className="mt-0">
                  <CardTitle>Payslips & Compensation</CardTitle>
                  <CardDescription>Your payslip history and compensation details</CardDescription>
                </TabsContent>
              </Tabs>
            </CardHeader>
            
            <CardContent>
              {activeTab === "attendance" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-green-50 rounded-lg p-3 text-center border border-green-100">
                      <p className="text-xs text-muted-foreground">Present</p>
                      <p className="text-xl font-bold text-green-600">{attendanceData?.present || 0}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3 text-center border border-red-100">
                      <p className="text-xs text-muted-foreground">Absent</p>
                      <p className="text-xl font-bold text-red-600">{attendanceData?.absent || 0}</p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-3 text-center border border-amber-100">
                      <p className="text-xs text-muted-foreground">Late</p>
                      <p className="text-xl font-bold text-amber-600">{attendanceData?.late || 0}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-100">
                      <p className="text-xs text-muted-foreground">On Leave</p>
                      <p className="text-xl font-bold text-blue-600">
                        {attendanceData ? attendanceData.total - attendanceData.present - attendanceData.absent - attendanceData.late : 0}
                      </p>
                    </div>
                  </div>
                  
                  <h4 className="font-medium mt-6">Recent Activity</h4>
                  <div className="border rounded-lg divide-y">
                    {attendanceData && attendanceData.recentRecords?.length > 0 ? 
                      attendanceData.recentRecords.slice(0, 5).map(record => (
                        <div key={record.id} className="flex justify-between items-center p-3">
                          <div>
                            <p className="font-medium">{new Date(record.date || '').toLocaleDateString()}</p>
                            <p className="text-sm text-muted-foreground">
                              {record.check_in ? `In: ${new Date(record.check_in).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 'No check-in'} 
                              {record.check_out ? ` - Out: ${new Date(record.check_out).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : ''}
                            </p>
                          </div>
                          <div className={`text-sm px-2 py-1 rounded ${
                            record.attendance_status === 'Present' ? 'bg-green-100 text-green-800' :
                            record.attendance_status === 'Absent' ? 'bg-red-100 text-red-800' :
                            record.attendance_status === 'Late' ? 'bg-amber-100 text-amber-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {record.attendance_status}
                          </div>
                        </div>
                      )) :
                      <div className="p-4 text-center text-muted-foreground">
                        No recent attendance records
                      </div>
                    }
                  </div>
                </div>
              )}
              
              {activeTab === "shifts" && (
                <div className="space-y-4">
                  <Tabs defaultValue={scheduleTab} onValueChange={setScheduleTab} className="w-full">
                    <TabsList className="mb-2">
                      <TabsTrigger value="my-shifts">Upcoming</TabsTrigger>
                      <TabsTrigger value="pending" className="relative">
                        Pending
                        {Object.keys(newSchedules).length > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {Object.keys(newSchedules).length}
                          </span>
                        )}
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  
                  <div className="border rounded-lg divide-y">
                    {schedules && schedules.length > 0 ? 
                      schedules
                        .filter(shift => {
                          if (scheduleTab === 'pending') return shift.status === 'pending';
                          if (scheduleTab === 'my-shifts') return shift.status !== 'pending';
                          return true;
                        })
                        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                        .slice(0, 5)
                        .map(shift => (
                          <div key={shift.id} className={`p-3 ${newSchedules[shift.id] ? 'bg-amber-50' : ''}`}>
                            <div className="flex justify-between">
                              <p className="font-medium">{shift.title}</p>
                              <div className={`text-xs px-2 py-1 rounded-full ${
                                shift.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                shift.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                shift.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {shift.status === 'pending' ? 'Needs Response' : 
                                 shift.status === 'confirmed' ? 'Confirmed' :
                                 shift.status === 'completed' ? 'Completed' : shift.status}
                              </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground">
                              {new Date(shift.start_time).toLocaleDateString()} • 
                              {new Date(shift.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                              {new Date(shift.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                            
                            {shift.location && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Location: {shift.location}
                              </p>
                            )}
                            
                            {shift.status === 'pending' && (
                              <div className="flex gap-2 mt-2">
                                <Button size="sm" variant="outline" className="w-full">
                                  Accept
                                </Button>
                                <Button size="sm" variant="outline" className="w-full" 
                                   style={{ color: 'rgb(239 68 68)', borderColor: 'rgb(239 68 68)' }}>
                                  Decline
                                </Button>
                              </div>
                            )}
                          </div>
                        )) :
                      <div className="p-4 text-center text-muted-foreground">
                        No {scheduleTab === 'pending' ? 'pending' : 'upcoming'} shifts scheduled
                      </div>
                    }
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    View Full Schedule
                  </Button>
                </div>
              )}
              
              {activeTab === "payslips" && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center">
                      <DollarSign className="h-10 w-10 text-blue-500 mr-3" />
                      <div>
                        <h3 className="text-lg font-medium">Current Monthly Salary</h3>
                        <p className="text-xl font-bold">
                          ${employeeData ? employeeData.salary.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <h4 className="font-medium mt-2">Recent Payslips</h4>
                  <div className="border rounded-lg divide-y">
                    {[...Array(3)].map((_, i) => {
                      const date = new Date();
                      date.setMonth(date.getMonth() - i);
                      
                      return (
                        <div key={i} className="flex justify-between items-center p-3">
                          <div>
                            <p className="font-medium">{date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                            <p className="text-sm text-muted-foreground">
                              Payment Date: {new Date(date.getFullYear(), date.getMonth() + 1, 1).toLocaleDateString()}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">
                            Download
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmployeeWorkflow;
