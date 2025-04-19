
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft } from "lucide-react"

const AttendanceControls = () => {
  return (
    <>
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
    </>
  )
}

export default AttendanceControls
