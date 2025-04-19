
const AttendanceStats = () => {
  return (
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
  )
}

export default AttendanceStats
