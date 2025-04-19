
import { ArrowLeft, Clock, Building2 } from "lucide-react"
import { Link } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAttendance } from "@/hooks/use-attendance"
import { format } from "date-fns"

const Attendance = () => {
  return (
    <div className="container max-w-2xl mx-auto px-4 pt-16 pb-20">
      <div className="flex items-center mb-6">
        <Link to="/dashboard">
          <Button variant="ghost" size="icon" className="mr-4">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold">Employee details</h1>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border mb-6">
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-16 w-16">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback>PD</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-semibold mb-2">Panji Dwi</h2>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1.5" />
                <span>Fulltime</span>
              </div>
              <div className="flex items-center">
                <Building2 className="h-4 w-4 mr-1.5" />
                <span>Onsite</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center border-b mb-6">
          <Tabs defaultValue="time" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-[-1px]">
              <TabsTrigger value="payroll">Payroll</TabsTrigger>
              <TabsTrigger value="time" className="font-semibold">Time management</TabsTrigger>
              <TabsTrigger value="assets">Assets</TabsTrigger>
              <TabsTrigger value="document">Document</TabsTrigger>
              <TabsTrigger value="training">Training</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Time Management</h3>
          
          <div className="flex gap-3 mb-8">
            <Button className="bg-[#1A1F2C] text-white hover:bg-[#2A2F3C]">Attendance</Button>
            <Button variant="outline" className="text-muted-foreground">Time Off</Button>
            <Button variant="outline" className="text-muted-foreground">Overtime</Button>
          </div>

          <div className="grid grid-cols-3 bg-gray-50 rounded-xl p-6 mb-8">
            <div>
              <p className="text-gray-600 mb-1">Day off</p>
              <p className="text-2xl font-semibold">12</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Late clock-in</p>
              <p className="text-2xl font-semibold">12</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">No clock-out</p>
              <p className="text-2xl font-semibold">34</p>
            </div>
          </div>

          <div className="mb-6">
            <Button variant="outline" className="w-full justify-between text-lg font-medium">
              October 2024
              <ArrowLeft className="h-5 w-5 rotate-[-90deg]" />
            </Button>
          </div>

          <div className="mb-6">
            <Input 
              type="search" 
              placeholder="Search" 
              className="bg-gray-50" 
            />
          </div>

          <AttendanceList />
        </div>
      </div>
    </div>
  )
}

const AttendanceList = () => {
  const { data: attendance } = useAttendance()

  if (!attendance?.recentRecords?.length) {
    return <div className="text-center text-muted-foreground py-8">No attendance records found</div>
  }

  return (
    <div className="space-y-4">
      {attendance.recentRecords.map((record) => (
        <div key={record.id} className="border rounded-xl p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-semibold mb-1">
                {format(new Date(record.date || ''), 'dd MMM yyyy')}
              </p>
              <p className="text-gray-600">
                Clockin {format(new Date(record.check_in || ''), 'HH:mm')} - {record.check_out ? format(new Date(record.check_out), 'HH:mm') : '19:00'}
              </p>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Approved
            </Badge>
          </div>
          <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-orange-500" />
        </div>
      ))}
    </div>
  )
}

export default Attendance;
