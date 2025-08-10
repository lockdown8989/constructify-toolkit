import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, User, Download } from "lucide-react";
import { useEmployeeDataManagement } from "@/hooks/use-employee-data-management";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import AttendanceDetailsModal from "./AttendanceDetailsModal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
interface AttendanceHeaderProps {
  overrideEmployeeId?: string;
  overrideEmployeeName?: string;
}
const AttendanceHeader = ({
  overrideEmployeeId,
  overrideEmployeeName
}: AttendanceHeaderProps) => {
  const {
    employeeData,
    isLoading
  } = useEmployeeDataManagement();
  const {
    isManager
  } = useAuth();
  const isMobile = useIsMobile();
  const {
    toast
  } = useToast();
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const targetEmployeeId = overrideEmployeeId || employeeData?.id;
  const targetEmployeeName = overrideEmployeeName || employeeData?.name;
  const handleViewDetails = () => {
    if (targetEmployeeId) {
      setIsDetailsModalOpen(true);
    } else {
      toast({
        title: "No employee selected",
        description: "Please select an employee to view details",
        variant: "destructive"
      });
    }
  };
  const handleExportData = () => {
    // Create CSV data for attendance
    const csvContent = "data:text/csv;charset=utf-8,Date,Status,Check In,Check Out,Hours\n";

    // In a real scenario, you would include actual attendance data here
    const dataRows = [`${new Date().toLocaleDateString()},Present,09:00,17:30,8.5`, `${new Date(Date.now() - 86400000).toLocaleDateString()},Present,08:55,17:45,8.83`, `${new Date(Date.now() - 86400000 * 2).toLocaleDateString()},Late,09:15,17:30,8.25`];
    const fullCsv = csvContent + dataRows.join('\n');

    // Create download link and trigger download
    const encodedUri = encodeURI(fullCsv);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: "Export successful",
      description: "Attendance data has been exported successfully",
      variant: "default"
    });
  };
  if (isLoading) {
    return <div className="flex items-center justify-between mb-6 md:mb-8 animate-pulse">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-gray-200" />
          <div className="space-y-2">
            <div className="h-5 md:h-6 w-32 md:w-48 bg-gray-200 rounded" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-8">
              {[1, 2, 3].map(i => <div key={i} className="space-y-1">
                  <div className="h-3 md:h-4 w-12 md:w-16 bg-gray-200 rounded" />
                  <div className="h-4 md:h-5 w-16 md:w-24 bg-gray-200 rounded" />
                </div>)}
            </div>
          </div>
        </div>
      </div>;
  }
  return <>
      <AttendanceDetailsModal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} employeeId={targetEmployeeId} employeeName={targetEmployeeName} />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
      <div className="flex items-start md:items-center gap-3 md:gap-4">
        <Avatar className="h-12 w-12 md:h-16 md:w-16 shrink-0">
          <AvatarImage src={employeeData?.avatar || "/placeholder.svg"} />
          <AvatarFallback>{employeeData?.name?.slice(0, 2).toUpperCase() || "EE"}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-lg md:text-2xl font-semibold mb-1">{employeeData?.name || "Employee name"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-8 text-gray-600 text-sm">
            <div>
              <span className="block text-xs md:text-sm">Role</span>
              <span>{employeeData?.job_title || "Not specified"}</span>
            </div>
            <div>
              <span className="block text-xs md:text-sm">Employee ID</span>
              <span>{employeeData?.id?.slice(0, 8) || "Not specified"}</span>
            </div>
            <div>
              <span className="block text-xs md:text-sm">Department</span>
              <span>{employeeData?.department || "Not specified"}</span>
            </div>
          </div>
        </div>
      </div>
      
      {isMobile ? <div className="flex justify-end gap-2 bg-slate-50 text-slate-950">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-950 bg-slate-50">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleViewDetails}>
                <User className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div> : <div className="flex items-center gap-2 self-end md:self-auto">
          <Button variant="outline" onClick={handleViewDetails} className="text-slate-50">
            View Details
          </Button>
          <Button variant="outline" onClick={handleExportData} className="text-slate-50">
            Export Data
          </Button>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>}
      </div>
    </>;
};
export default AttendanceHeader;