
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const AttendanceTabs = () => {
  return (
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
  )
}

export default AttendanceTabs
