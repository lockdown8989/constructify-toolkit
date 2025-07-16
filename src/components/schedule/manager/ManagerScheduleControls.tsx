
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Users, 
  Clock, 
  Settings, 
  Eye, 
  Send,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { startOfWeek, endOfWeek, formatISO } from 'date-fns';
import { batchApproveAllPendingRotas } from '@/services/rota-management/rota-auto-confirm';
import { useToast } from '@/hooks/use-toast';

interface ManagerScheduleControlsProps {
  onCreateShift: () => void;
  onPublishSchedule: () => void;
  onCreateTemplate: () => void;
  onManageOpenShifts: () => void;
  openShiftsCount: number;
  unpublishedCount: number;
}

const thisWeekRange = () => {
  const now = new Date();
  const start = startOfWeek(now, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(now, { weekStartsOn: 1 });
  return {
    start: formatISO(start, { representation: 'date' }),
    end: formatISO(end, { representation: 'date' }),
  };
};

const useScheduleStats = () => {
  const [stats, setStats] = useState<{ total: number; filled: number; open: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const { start, end } = thisWeekRange();

        // Fetch total shifts (scheduled for this week)
        const { count: totalCount, error: totalErr } = await supabase
          .from('schedules')
          .select('id', { count: 'exact', head: true })
          .gte('start_time', start)
          .lte('start_time', end);

        if (totalErr) throw totalErr;

        // Fetch filled shifts (assigned: employee_id is NOT NULL)
        const { count: filledCount, error: filledErr } = await supabase
          .from('schedules')
          .select('id', { count: 'exact', head: true })
          .gte('start_time', start)
          .lte('start_time', end)
          .not('employee_id', 'is', null);

        if (filledErr) throw filledErr;

        // Fetch open shifts (employee_id IS NULL OR status in 'draft', or open_shifts table)
        const { count: openCount1, error: openErr1 } = await supabase
          .from('schedules')
          .select('id', { count: 'exact', head: true })
          .gte('start_time', start)
          .lte('start_time', end)
          .is('employee_id', null);

        if (openErr1) throw openErr1;

        // Plus published open shifts from open_shifts table this week
        const { count: openCount2, error: openErr2 } = await supabase
          .from('open_shifts')
          .select('id', { count: 'exact', head: true })
          .gte('start_time', start)
          .lte('start_time', end)
          .in('status', ['open', 'published']);

        if (openErr2) throw openErr2;

        setStats({
          total: totalCount || 0,
          filled: filledCount || 0,
          open: (openCount1 || 0) + (openCount2 || 0),
        });
      } catch (err: any) {
        setError('Unable to load schedule stats.');
      }
      setLoading(false);
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
};

const ManagerScheduleControls: React.FC<ManagerScheduleControlsProps> = ({
  onCreateShift,
  onPublishSchedule,
  onCreateTemplate,
  onManageOpenShifts,
  openShiftsCount,
  unpublishedCount,
}) => {
  const { isAdmin, isManager, isHR } = useAuth();
  const hasManagerAccess = isAdmin || isManager || isHR;
  const { toast } = useToast();
  const [isApproving, setIsApproving] = useState(false);

  const { stats, loading, error } = useScheduleStats();

  const handleBatchApproveRotas = async () => {
    setIsApproving(true);
    try {
      const result = await batchApproveAllPendingRotas();
      
      if (result.success) {
        toast({
          title: "✅ Rota Shifts Approved",
          description: `Successfully auto-confirmed ${result.count} pending rota shifts. Employees have been notified.`,
        });
      } else {
        toast({
          title: "❌ Approval Failed",
          description: "There was an error approving the rota shifts. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Approval Failed",
        description: "There was an error approving the rota shifts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsApproving(false);
    }
  };

  if (!hasManagerAccess) return null;

  return (
    <div className="space-y-4">
      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Schedule Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={onManageOpenShifts} 
              variant="outline" 
              className="w-full relative"
            >
              <Eye className="h-4 w-4 mr-2" />
              Open Shifts
              {openShiftsCount > 0 && (
                <Badge variant="destructive" className="ml-2 text-xs">
                  {openShiftsCount}
                </Badge>
              )}
            </Button>
            <Button 
              onClick={onPublishSchedule} 
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Send className="h-4 w-4 mr-2" />
              Publish
              {unpublishedCount > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs bg-white text-green-700">
                  {unpublishedCount}
                </Badge>
              )}
            </Button>
          </div>
          
          {/* Batch Approve Rota Button */}
          <Button 
            onClick={handleBatchApproveRotas}
            disabled={isApproving}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {isApproving ? 'Approving...' : 'Auto-Approve All Rotas'}
          </Button>
        </CardContent>
      </Card>

      {/* Schedule Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            This Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse h-14 flex items-center justify-center text-gray-400">Loading…</div>
          ) : error ? (
            <div className="text-red-500 text-center">{error}</div>
          ) : (
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats?.total}</div>
                <div className="text-xs text-gray-500">Total Shifts</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{stats?.filled}</div>
                <div className="text-xs text-gray-500">Filled</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{stats?.open}</div>
                <div className="text-xs text-gray-500">Open</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Labor Hours */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Labor Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Scheduled</span>
              <span className="font-medium">192h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Overtime</span>
              <span className="font-medium text-orange-600">8h</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-sm font-medium">Labor Cost</span>
              <span className="font-bold">£4,800</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerScheduleControls;

