
import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ShiftCalendar from '@/components/schedule/ShiftCalendar';
import EmployeeScheduleView from '@/components/schedule/EmployeeScheduleView';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, MessageSquare, AlertCircle, HelpCircle, Download } from 'lucide-react';
import ScheduleCalendarView from '@/components/schedule/ScheduleCalendarView';

const Schedule = () => {
  const { user, isAdmin, isHR, isManager } = useAuth();
  const [activeTab, setActiveTab] = useState('schedule');
  const isMobile = useIsMobile();
  const [currentDate, setCurrentDate] = useState(new Date());

  const hasManagerAccess = isAdmin || isHR || isManager;
  
  return (
    <div className="container py-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Schedule</h1>
          <p className="text-gray-500">View and manage your work schedule</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="flex gap-2 items-center">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
          <Button className="flex gap-2 items-center">
            <Calendar className="h-4 w-4" />
            <span>My Calendar</span>
          </Button>
        </div>
      </div>
      
      <Tabs 
        defaultValue={activeTab} 
        onValueChange={setActiveTab} 
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>My Schedule</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Team Schedule</span>
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>Requests</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="schedule" className="mt-0">
          <div className={`bg-white rounded-lg shadow ${isMobile ? 'mx-[-0.5rem]' : ''}`}>
            <EmployeeScheduleView />
          </div>
        </TabsContent>
        
        <TabsContent value="team" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Team Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <ShiftCalendar />
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between">
                    <span>Team Members</span>
                    <Button variant="ghost" size="sm" className="text-xs">View All</Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {['Jane Smith', 'John Doe', 'Alice Johnson', 'Robert Brown'].map((name, i) => (
                      <div key={i} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            {name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span>{name}</span>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${i % 3 === 0 ? 'bg-green-500' : i % 3 === 1 ? 'bg-orange-500' : 'bg-red-500'}`}></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-yellow-800">Shift Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-yellow-800">Schedule conflict for Jane Smith</p>
                        <p className="text-yellow-700 text-xs">Double-booked on Jun 15</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-yellow-800">Pending approval</p>
                        <p className="text-yellow-700 text-xs">3 shifts need manager approval</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="requests" className="mt-0">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Time Off Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500">Submit and track time off requests</p>
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium">Request Time Off</h3>
                      <p className="text-sm text-gray-500 mb-4">Select dates and reason for your absence</p>
                      <Button>New Request</Button>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h3 className="font-medium mb-2">Recent Requests</h3>
                      <div className="text-sm text-gray-500">
                        No recent requests found
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Shift Swap Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500">Swap shifts with team members</p>
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium">Request Shift Swap</h3>
                      <p className="text-sm text-gray-500 mb-4">Select your shift and a colleague to swap with</p>
                      <Button>New Swap</Button>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h3 className="font-medium mb-2">Active Requests</h3>
                      <div className="text-sm text-gray-500">
                        No active swap requests
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-6 bg-blue-50 p-4 rounded-lg flex gap-3 border border-blue-100">
              <HelpCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-800">Need help with scheduling?</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Contact your manager for assistance with schedule changes or view our 
                  <a href="#" className="text-blue-600 underline ml-1">help documentation</a>.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Schedule;
