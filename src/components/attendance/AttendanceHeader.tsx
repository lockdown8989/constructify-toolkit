
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { useEmployeeDataManagement } from "@/hooks/use-employee-data-management";

const AttendanceHeader = () => {
  const { employeeData, isLoading } = useEmployeeDataManagement();

  if (isLoading) {
    return (
      <div className="flex items-center justify-between mb-8 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-gray-200" />
          <div className="space-y-2">
            <div className="h-6 w-48 bg-gray-200 rounded" />
            <div className="grid grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-1">
                  <div className="h-4 w-16 bg-gray-200 rounded" />
                  <div className="h-5 w-24 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={employeeData?.avatar || "/placeholder.svg"} />
          <AvatarFallback>{employeeData?.name?.slice(0, 2).toUpperCase() || "EE"}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-semibold mb-1">{employeeData?.name || "Employee name"}</h2>
          <div className="grid grid-cols-3 gap-8 text-gray-600">
            <div>
              <span className="block text-sm">Role</span>
              <span>{employeeData?.job_title || "Not specified"}</span>
            </div>
            <div>
              <span className="block text-sm">Employee ID</span>
              <span>{employeeData?.id?.slice(0, 8) || "Not specified"}</span>
            </div>
            <div>
              <span className="block text-sm">Department</span>
              <span>{employeeData?.department || "Not specified"}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" className="text-gray-600">
          View Details
        </Button>
        <Button variant="default" className="bg-emerald-600 hover:bg-emerald-700">
          Add Attendance
        </Button>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default AttendanceHeader;
