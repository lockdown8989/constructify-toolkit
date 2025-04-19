
import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Clock, Building2 } from "lucide-react"

const AttendanceHeader = () => {
  return (
    <>
      <div className="flex items-center mb-6">
        <Link to="/dashboard">
          <Button variant="ghost" size="icon" className="mr-4">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold">Employee details</h1>
      </div>

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
    </>
  )
}

export default AttendanceHeader
