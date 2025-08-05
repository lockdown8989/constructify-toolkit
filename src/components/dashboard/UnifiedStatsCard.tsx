
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';
import { Skeleton } from '@/components/ui/skeleton';

const UnifiedStatsCard: React.FC = () => {
  const { stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Dashboard Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center space-y-2">
                <Skeleton className="h-8 w-8 mx-auto rounded-full" />
                <Skeleton className="h-6 w-16 mx-auto" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const statItems = [
    {
      title: "Active Employees",
      value: stats.activeEmployees.toString(),
      description: "Currently clocked in",
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      title: "Today's Hours",
      value: stats.todaysHours.toString(),
      description: "Total hours worked",
      icon: Clock,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-900/20"
    },
    {
      title: "Overtime",
      value: stats.overtimeHours.toString(),
      description: "Hours this week",
      icon: TrendingUp,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-900/20"
    },
    {
      title: "Alerts",
      value: stats.alerts.toString(),
      description: "Require attention",
      icon: AlertTriangle,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-900/20"
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></div>
          Live Dashboard Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {statItems.map((item, index) => (
            <div key={index} className="text-center space-y-2">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${item.bg} ${item.color}`}>
                <item.icon className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{item.value}</div>
                <div className="text-sm text-muted-foreground">{item.title}</div>
                <div className="text-xs text-muted-foreground/70">{item.description}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-xs text-muted-foreground/60 text-center">
          Updates every 30 seconds • Last updated: {new Date().toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
};

export default UnifiedStatsCard;
