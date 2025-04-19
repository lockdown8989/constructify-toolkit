
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Calendar } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useIsMobile } from "@/hooks/use-mobile"
import { useState } from "react"

interface AttendanceControlsProps {
  onSearchChange: (value: string) => void;
}

const AttendanceControls = ({ onSearchChange }: AttendanceControlsProps) => {
  const isMobile = useIsMobile();
  const [month, setMonth] = useState("October 2023");
  
  // Fake month navigation - in a real app, this would update the actual data
  const handlePreviousMonth = () => {
    setMonth("September 2023");
  };
  
  const handleNextMonth = () => {
    setMonth("November 2023");
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4 md:mb-6">
      <div className="flex items-center gap-2 w-full md:w-auto">
        <div className="flex items-center p-1 bg-gray-100 rounded-lg">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={handlePreviousMonth}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <h3 className="text-sm md:text-base font-medium px-2">{month}</h3>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={handleNextMonth}
          >
            <ArrowLeft className="h-4 w-4 rotate-180" />
          </Button>
        </div>
        
        {!isMobile && (
          <Button variant="outline" size="sm" className="ml-2 h-8">
            <Calendar className="h-3.5 w-3.5 mr-1.5" />
            <span>Today</span>
          </Button>
        )}
      </div>
      
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full md:w-auto">
        <Input 
          type="search" 
          placeholder="Search employee" 
          className="md:w-48 h-9"
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <Select defaultValue="all">
          <SelectTrigger className="w-full md:w-36 h-9">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="present">Present</SelectItem>
            <SelectItem value="absent">Absent</SelectItem>
            <SelectItem value="late">Late</SelectItem>
          </SelectContent>
        </Select>
        
        {isMobile && (
          <Button variant="outline" size="sm" className="h-9">
            <Calendar className="h-3.5 w-3.5 mr-1.5" />
            <span>Today</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default AttendanceControls;
