
import React, { useState } from "react";
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
import type { LeaveCalendar } from "@/hooks/use-leave-calendar";
import type { Employee } from "@/hooks/use-employees";

const LeaveApprovalDashboard: React.FC = () => {
  const { data: leaves = [], isLoading: isLoadingLeaves } = useLeaveCalendar();
  const { data: employees = [], isLoading: isLoadingEmployees } = useEmployees();
  const { mutate: updateLeave } = useUpdateLeaveCalendar();
  const { mutate: updateEmployee } = useUpdateEmployee();
  const { toast } = useToast();
  
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  
  // Get only pending leave requests for the approval table
  const pendingLeaves = leaves.filter(leave => leave.status === "Pending");
  
  // Apply filters
  const filteredLeaves = pendingLeaves.filter(leave => {
    const employee = employees.find(emp => emp.id === leave.employee_id);
    
    const matchesEmployee = selectedEmployee === "all" || leave.employee_id === selectedEmployee;
    const matchesDepartment = selectedDepartment === "all" || (employee && employee.department === selectedDepartment);
    const matchesType = selectedType === "all" || leave.type === selectedType;
    
    return matchesEmployee && matchesDepartment && matchesType;
  });
  
  // Get unique departments for filter
  const departments = [...new Set(employees.map(emp => emp.department))];
  
  // Get unique leave types for filter
  const leaveTypes = [...new Set(leaves.map(leave => leave.type))];
  
  // Calculate the number of leave days
  const calculateLeaveDays = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return differenceInCalendarDays(end, start) + 1; // Include both start and end dates
  };
  
  // Update employee status to "On Leave" when leave is approved
  const updateEmployeeStatus = (employeeId: string, startDate: string, endDate: string) => {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Only update status if leave period includes current date
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
  
  const handleApprove = (leave: LeaveCalendar) => {
    updateLeave(
      { id: leave.id, status: "Approved" },
      {
        onSuccess: () => {
          // Update employee status if leave includes current date
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
    updateLeave(
      { id: leave.id, status: "Rejected" },
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
