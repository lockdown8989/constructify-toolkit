
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useIsMobile } from "@/hooks/use-mobile"

const AttendanceControls = () => {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-medium">October 2023</h3>
        <div className="flex">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4 rotate-180" />
          </Button>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
        <Input 
          type="search" 
          placeholder="Search" 
          className="md:w-64"
        />
        <Select defaultValue="all">
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="present">Present</SelectItem>
            <SelectItem value="absent">Absent</SelectItem>
            <SelectItem value="late">Late</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default AttendanceControls;
