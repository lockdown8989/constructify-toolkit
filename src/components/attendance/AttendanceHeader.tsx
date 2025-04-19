
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

const AttendanceHeader = () => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src="/placeholder.svg" />
          <AvatarFallback>PD</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-semibold mb-1">Employee name</h2>
          <div className="grid grid-cols-3 gap-8 text-gray-600">
            <div>
              <span className="block text-sm">Role</span>
              <span>UI Designer</span>
            </div>
            <div>
              <span className="block text-sm">Employee ID</span>
              <span>#EMP07</span>
            </div>
            <div>
              <span className="block text-sm">Phone Number</span>
              <span>+62 921 019 112</span>
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
