
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LeaveRequestForm from "@/components/leave/LeaveRequestForm";
import LeaveApprovalDashboard from "@/components/leave/LeaveApprovalDashboard";
import LeaveCalendarView from "@/components/leave/LeaveCalendarView";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useEmployees } from "@/hooks/use-employees";

const LeaveManagement = () => {
  // For demonstration purposes, we're using a hardcoded employee ID
  // In a real app, this would come from authentication/user context
  const currentEmployeeId = "550e8400-e29b-41d4-a716-446655440000";
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get employees data to determine user role
  const { data: employees = [] } = useEmployees();
  
  // For demonstration, determine if the current user is a manager
  // In a real app, this would come from user roles/permissions
  const currentEmployee = employees.find(emp => emp.id === currentEmployeeId);
  const isManager = currentEmployee && 
    (currentEmployee.job_title.toLowerCase().includes("manager") || 
     currentEmployee.job_title.toLowerCase().includes("director") ||
     currentEmployee.department === "HR");
  
  // Get the current employee's department
  const currentEmployeeDepartment = currentEmployee?.department || "Engineering";
  
  // Set up real-time listener for leave calendar changes
  useEffect(() => {
    const channel = supabase
      .channel('leave_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leave_calendar'
        },
        (payload) => {
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['leave_calendar'] });
          
          // Show toast notification for specific events
          if (payload.eventType === 'UPDATE') {
            const newStatus = payload.new.status;
            if (newStatus === 'Approved') {
              toast({
                title: "Leave request approved",
                description: "A leave request has been approved.",
              });
            } else if (newStatus === 'Rejected') {
              toast({
                title: "Leave request rejected",
                description: "A leave request has been rejected.",
              });
            }
          } else if (payload.eventType === 'INSERT') {
            toast({
              title: "New leave request",
              description: "A new leave request has been submitted.",
            });
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, toast]);
  
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Leave Management</h1>
      
      <Tabs defaultValue="employee">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="employee">Employee View</TabsTrigger>
          <TabsTrigger value="manager" disabled={!isManager}>Manager View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="employee" className="space-y-4">
          <div className="max-w-md mx-auto">
            <LeaveRequestForm 
              employeeId={currentEmployeeId}
              employeeDepartment={currentEmployeeDepartment}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="manager">
          {isManager ? (
            <LeaveApprovalDashboard />
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              You don't have permission to access this view.
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="calendar">
          <LeaveCalendarView />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeaveManagement;
