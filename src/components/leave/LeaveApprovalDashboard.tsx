import React, { useState, useEffect } from "react";
import { format, differenceInCalendarDays, addDays } from "date-fns";
import { useLeaveCalendar } from "@/hooks/use-leave-calendar";
import { useEmployees } from "@/hooks/use-employees";
import { useUpdateLeaveCalendar } from "@/hooks/use-leave-calendar";
import { useUpdateEmployee } from "@/hooks/use-employees";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import type { LeaveCalendar } from "@/hooks/use-leave-calendar";
import type { Employee } from "@/hooks/use-employees";

const LeaveApprovalDashboard: React.FC = () => {
  const { data: leaves = [], isLoading: isLoadingLeaves } = useLeaveCalendar();
  const { data: employees = [], isLoading: isLoadingEmployees } = useEmployees();
  const { mutate: updateLeave } = useUpdateLeaveCalendar();
  const { mutate: updateEmployee } = useUpdateEmployee();
  const { toast } = useToast();
  
  const currentUser = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Valentina Cortez",
    department: "HR",
    isManager: true
  };
  
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  
  const pendingLeaves = leaves.filter(leave => leave.status === "Pending");
  
  const filteredLeaves = pendingLeaves.filter(leave => {
    const employee = employees.find(emp => emp.id === leave.employee_id);
    
    if (currentUser.isManager && !currentUser.department.includes("HR")) {
      if (employee && employee.department !== currentUser.department) {
        return false;
      }
    }
    
    const matchesEmployee = selectedEmployee === "all" || leave.employee_id === selectedEmployee;
    const matchesDepartment = selectedDepartment === "all" || (employee && employee.department === selectedDepartment);
    const matchesType = selectedType === "all" || leave.type === selectedType;
    
    return matchesEmployee && matchesDepartment && matchesType;
  });
  
  const departments = [...new Set(employees.map(emp => emp.department))];
  
  const leaveTypes = [...new Set(leaves.map(leave => leave.type))];
  
  const calculateLeaveDays = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return differenceInCalendarDays(end, start) + 1;
  };
  
  const updateEmployeeStatus = (employeeId: string, startDate: string, endDate: string) => {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (today >= start && today <= end) {
      updateEmployee(
        { id: employeeId, status: "Leave" },
        {
          onError: (error) => {
            console.error("Error updating employee status:", error);
            toast({
              title: "Error",
              description: "Failed to update employee status.",
              variant: "destructive",
            });
          },
        }
      );
    }
  };
  
  const createAuditLog = (leave: LeaveCalendar, action: "Approved" | "Rejected"): string => {
    const currentDate = format(new Date(), "yyyy-MM-dd HH:mm:ss");
    const existingNotes = leave.notes || "";
    const auditEntry = `${action} by ${currentUser.name} on ${currentDate}`;
    
    return existingNotes
      ? `${existingNotes}\n\n${auditEntry}`
      : auditEntry;
  };
  
  const handleApprove = (leave: LeaveCalendar) => {
    const auditLog = createAuditLog(leave, "Approved");
    
    updateLeave(
      { id: leave.id, status: "Approved", notes: auditLog },
      {
        onSuccess: () => {
          updateEmployeeStatus(leave.employee_id, leave.start_date, leave.end_date);
          
          toast({
            title: "Leave approved",
            description: "The leave request has been approved successfully.",
          });
        },
        onError: (error) => {
          console.error("Error approving leave:", error);
          toast({
            title: "Error",
            description: "Failed to approve the leave request. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };
  
  const handleReject = (leave: LeaveCalendar) => {
    const auditLog = createAuditLog(leave, "Rejected");
    
    updateLeave(
      { id: leave.id, status: "Rejected", notes: auditLog },
      {
        onSuccess: () => {
          toast({
            title: "Leave rejected",
            description: "The leave request has been rejected.",
          });
        },
        onError: (error) => {
          console.error("Error rejecting leave:", error);
          toast({
            title: "Error",
            description: "Failed to reject the leave request. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };
  
  const getEmployeeName = (employeeId: string): string => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : "Unknown Employee";
  };
  
  const getEmployeeDepartment = (employeeId: string): string => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.department : "Unknown";
  };
  
  const queryClient = useQueryClient();
  
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
          queryClient.invalidateQueries({ queryKey: ['leave_calendar'] });
          
          if (payload.eventType === 'UPDATE') {
            const newStatus = payload.new.status;
            const oldStatus = payload.old.status;
            
            if (oldStatus === 'Pending' && newStatus === 'Approved') {
              toast({
                title: "Leave request approved",
                description: "A leave request has been approved.",
              });
            } else if (oldStatus === 'Pending' && newStatus === 'Rejected') {
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
  
  if (isLoadingLeaves || isLoadingEmployees) {
    return <div className="flex justify-center p-6">Loading...</div>;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave Approval Dashboard</CardTitle>
        <CardDescription>
          Review and manage employee leave requests
        </CardDescription>
        
        <div className="flex flex-wrap gap-2 pt-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Filter by Employee</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <DropdownMenuRadioItem value="all">All Employees</DropdownMenuRadioItem>
                {employees.map((employee) => (
                  <DropdownMenuRadioItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Filter by Department</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <DropdownMenuRadioItem value="all">All Departments</DropdownMenuRadioItem>
                {departments.map((department) => (
                  <DropdownMenuRadioItem key={department} value={department}>
                    {department}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={selectedType} onValueChange={setSelectedType}>
                <DropdownMenuRadioItem value="all">All Types</DropdownMenuRadioItem>
                {leaveTypes.map((type) => (
                  <DropdownMenuRadioItem key={type} value={type}>
                    {type}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredLeaves.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            No pending leave requests found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeaves.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell className="font-medium">{getEmployeeName(leave.employee_id)}</TableCell>
                    <TableCell>{getEmployeeDepartment(leave.employee_id)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        leave.type === "Holiday" ? "bg-blue-100 text-blue-800" :
                        leave.type === "Sickness" ? "bg-red-100 text-red-800" :
                        leave.type === "Personal" ? "bg-purple-100 text-purple-800" :
                        leave.type === "Parental" ? "bg-green-100 text-green-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {leave.type}
                      </span>
                    </TableCell>
                    <TableCell>{format(new Date(leave.start_date), "PP")}</TableCell>
                    <TableCell>{format(new Date(leave.end_date), "PP")}</TableCell>
                    <TableCell>{calculateLeaveDays(leave.start_date, leave.end_date)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{leave.notes || "-"}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 w-8 p-0" 
                          onClick={() => handleApprove(leave)}
                        >
                          <Check className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 w-8 p-0" 
                          onClick={() => handleReject(leave)}
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeaveApprovalDashboard;
