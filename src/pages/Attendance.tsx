
import { useState } from 'react';
import { useAuth } from "@/hooks/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User } from "lucide-react";
import { Navigate } from "react-router-dom";

const Attendance = () => {
  const { isManager, isAdmin, isHR } = useAuth();
  const hasManagerialAccess = isManager || isAdmin || isHR;
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Redirect non-managers away from this page
  if (!hasManagerialAccess) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Attendance Management</h1>
        <Button className="bg-[#2A6877] hover:bg-[#1d4d58]">
          Add New Entry
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 col-span-1 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Today's Attendance</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div className="flex items-center">
                <User className="h-5 w-5 mr-2 text-gray-500" />
                <span>John Smith</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-green-500" />
                <span>08:45 AM - Present</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div className="flex items-center">
                <User className="h-5 w-5 mr-2 text-gray-500" />
                <span>Sarah Johnson</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-green-500" />
                <span>09:00 AM - Present</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div className="flex items-center">
                <User className="h-5 w-5 mr-2 text-gray-500" />
                <span>Mike Chen</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-red-500" />
                <span>Absent</span>
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Employees</span>
              <span className="font-medium">12</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Present</span>
              <span className="font-medium text-green-600">10</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Absent</span>
              <span className="font-medium text-red-600">2</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Late</span>
              <span className="font-medium text-yellow-600">1</span>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Recent Reports</h3>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                <span>Weekly Attendance Report</span>
              </div>
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                <span>Monthly Attendance Summary</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Attendance;
