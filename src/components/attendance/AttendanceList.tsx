
import { Badge } from "@/components/ui/badge"
import { useAttendance } from "@/hooks/use-attendance"
import { format } from "date-fns"

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

export default AttendanceList
