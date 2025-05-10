
import { useEffect, useState } from "react";
import TimeClockWidget from "@/components/schedule/TimeClockWidget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Clock, Clipboard, History, Calendar } from "lucide-react";
import { useAttendanceSync } from "@/hooks/use-attendance-sync";
import { format } from "date-fns";

const TimeClock = () => {
  // Make sure we have our attendance sync initialized at page level
  useAttendanceSync();
  const [activeTab, setActiveTab] = useState("clock");

  useEffect(() => {
    // Page-level initialization
    document.title = "Time Clock | Team Management";
  }, []);
  
  return (
    <div className="container py-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Time Clock</h1>
        <p className="text-gray-500 mb-6">Record your work hours and manage breaks</p>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="clock" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Clock In/Out</span>
            </TabsTrigger>
            <TabsTrigger value="timesheet" className="flex items-center gap-2">
              <Clipboard className="h-4 w-4" />
              <span>My Timesheet</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span>History</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="clock">
            <Card className="shadow-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-medium">Today's Shift</h2>
                    <p className="text-gray-500">{format(new Date(), 'EEEE, MMMM do, yyyy')}</p>
                  </div>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>My Schedule</span>
                  </Button>
                </div>
                
                <TimeClockWidget />
                
                <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="font-medium text-blue-800 mb-2">About Automatic Timesheets</h3>
                  <p className="text-sm text-blue-700">
                    Your clock in/out times are automatically recorded and used to generate your timesheet.
                    Managers can review and approve your hours before payroll processing.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="timesheet">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Current Pay Period Timesheet</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clock In</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clock Out</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {[...Array(7)].map((_, i) => {
                        const date = new Date();
                        date.setDate(date.getDate() - i);
                        
                        return (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm">{format(date, 'MMM dd')}</td>
                            <td className="py-3 px-4 text-sm">{i % 3 === 0 ? '—' : '9:00 AM'}</td>
                            <td className="py-3 px-4 text-sm">{i % 3 === 0 ? '—' : '5:00 PM'}</td>
                            <td className="py-3 px-4 text-sm">{i % 3 === 0 ? '—' : '8.0'}</td>
                            <td className="py-3 px-4 text-sm">
                              {i % 3 === 0 ? (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                  Off
                                </span>
                              ) : i % 5 === 0 ? (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                  Pending
                                </span>
                              ) : (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  Approved
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button variant="outline">Download PDF</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Time Clock History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - (i * 7));
                    
                    return (
                      <div key={i} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">Week of {format(date, 'MMM dd, yyyy')}</h3>
                          <div className="text-sm text-gray-500">
                            Total Hours: {(32 + i).toFixed(1)}
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          Status: {i === 0 ? 'Current' : i === 1 ? 'Pending Approval' : 'Approved'}
                        </div>
                        <div className="mt-2 flex gap-2">
                          <Button variant="outline" size="sm">View Details</Button>
                          <Button variant="ghost" size="sm">Export</Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TimeClock;
