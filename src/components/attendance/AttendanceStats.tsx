
import { useAttendance } from "@/hooks/use-attendance";

const AttendanceStats = () => {
  const { data: stats } = useAttendance();
  
  return (
    <div className="grid grid-cols-6 gap-4 mb-8">
      <StatCard
        title="Day off"
        value={stats?.dayOff ?? 12}
        change={12}
        trend="up"
      />
      <StatCard
        title="Late clock-in"
        value={stats?.lateClock ?? 6}
        change={-2}
        trend="down"
      />
      <StatCard
        title="Late clock-out"
        value={stats?.lateClockOut ?? 21}
        change={-12}
        trend="down"
      />
      <StatCard
        title="No clock-out"
        value={stats?.noClockOut ?? 2}
        change={4}
        trend="up"
      />
      <StatCard
        title="Off time quota"
        value={stats?.offTimeQuota ?? 1}
        change={0}
        trend="neutral"
      />
      <StatCard
        title="Absent"
        value={stats?.absent ?? 2}
        change={0}
        trend="neutral"
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
