import { useAttendance } from "@/hooks/use-attendance";

interface AttendanceStatsProps {
  employeeId?: string;
}

const AttendanceStats = ({ employeeId }: AttendanceStatsProps) => {
  const { data: stats } = useAttendance(employeeId);
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
      <StatCard
        title="Present"
        value={stats?.present ?? 0}
        change={12}
        trend="up"
      />
      <StatCard
        title="Late clock-in"
        value={stats?.late ?? 0}
        change={-2}
        trend="down"
      />
      <StatCard
        title="Absent"
        value={stats?.absent ?? 0}
        change={0}
        trend="neutral"
      />
      <StatCard
        title="Total"
        value={stats?.total ?? 0}
        change={4}
        trend="up"
      />
      <StatCard
        title="Pending"
        value={stats?.recentRecords?.filter(r => r.status === "Pending").length ?? 0}
        change={0}
        trend="neutral"
      />
      <StatCard
        title="Approved"
        value={stats?.recentRecords?.filter(r => r.status === "Approved").length ?? 2}
        change={2}
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
