
import { useAttendance } from "@/hooks/use-attendance";

interface AttendanceStatsProps {
  employeeId?: string;
}

const AttendanceStats = ({ employeeId }: AttendanceStatsProps) => {
  console.log('AttendanceStats rendered with employeeId:', employeeId);
  
  const { data: stats, isLoading, error } = useAttendance(employeeId);
  
  console.log('AttendanceStats - hook results:', { stats, isLoading, error });
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-4 shadow-sm animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded mb-1"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }
  
  if (error) {
    console.error('AttendanceStats error:', error);
    return (
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        <div className="col-span-full bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          Error loading attendance data. Please try again.
        </div>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
      <StatCard
        title="Present"
        value={stats?.present ?? 0}
        change={stats?.present - (stats?.absent ?? 0)}
        trend={stats?.present ?? 0 > (stats?.absent ?? 0) ? "up" : "down"}
      />
      <StatCard
        title="Late clock-in"
        value={stats?.late ?? 0}
        change={-(stats?.late ?? 0)}
        trend="down"
      />
      <StatCard
        title="Absent"
        value={stats?.absent ?? 0}
        change={-(stats?.absent ?? 0)}
        trend="down"
      />
      <StatCard
        title="Total"
        value={stats?.total ?? 0}
        change={0}
        trend="neutral"
      />
      <StatCard
        title="Pending"
        value={stats?.pending ?? 0}
        change={-(stats?.pending ?? 0)}
        trend="down"
      />
      <StatCard
        title="Approved"
        value={stats?.approved ?? 0}
        change={stats?.approved ?? 0}
        trend="up"
      />
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  change: number;
  trend: "up" | "down" | "neutral";
}

const StatCard = ({ title, value, change, trend }: StatCardProps) => {
  const trendColor = 
    trend === "up" ? "text-emerald-600" : 
    trend === "down" ? "text-red-600" : 
    "text-gray-600";

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <p className="text-gray-600 mb-1 text-sm">{title}</p>
      <p className="text-2xl font-semibold mb-1">{value}</p>
      <p className={`text-sm ${trendColor}`}>
        {change > 0 ? "+" : ""}{change} vs last month
      </p>
    </div>
  );
};

export default AttendanceStats;
