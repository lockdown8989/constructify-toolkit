import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const CurrentShiftsCard = () => {
  const today = new Date().toISOString().split('T')[0];

  const { data: publishedShifts = [], isLoading: publishedLoading, error: publishedError } = useQuery({
    queryKey: ['published-shifts', today],
    queryFn: async () => {
      console.log('Fetching published shifts for:', today);
      
      const { data, error } = await supabase
        .from('schedules')
        .select(`
          *,
          employees!inner(id, name, email)
        `)
        .eq('published', true)
        .gte('start_time', `${today}T00:00:00`)
        .lt('start_time', `${today}T23:59:59`)
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching published shifts:', error);
        throw error;
      }
      
      console.log('Found published shifts:', data?.length || 0);
      return data || [];
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const { data: openShifts = [], isLoading: openLoading, error: openError } = useQuery({
    queryKey: ['open-shifts', today],
    queryFn: async () => {
      console.log('Fetching open shifts for:', today);
      
      const { data, error } = await supabase
        .from('open_shifts')
        .select('*')
        .in('status', ['available', 'pending', 'open'])
        .gte('start_time', `${today}T00:00:00`)
        .lt('start_time', `${today}T23:59:59`)
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching open shifts:', error);
        throw error;
      }
      
      console.log('Found open shifts:', data?.length || 0);
      return data || [];
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Log any errors
  React.useEffect(() => {
    if (publishedError) {
      console.error('Published shifts error:', publishedError);
    }
    if (openError) {
      console.error('Open shifts error:', openError);
    }
  }, [publishedError, openError]);

  const isLoading = publishedLoading || openLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Shifts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-pulse text-muted-foreground">Loading shifts...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Today's Shifts ({format(new Date(), 'MMM dd, yyyy')})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Published Shifts */}
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Published Shifts ({publishedShifts.length})
          </h4>
          {publishedShifts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No published shifts today</p>
          ) : (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {publishedShifts.slice(0, 3).map((shift: any) => (
                <div key={shift.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{shift.employees.name}</p>
                    <p className="text-xs text-muted-foreground">{shift.title}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span className="text-xs">
                      {format(new Date(shift.start_time), 'HH:mm')} - {format(new Date(shift.end_time), 'HH:mm')}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {shift.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {publishedShifts.length > 3 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{publishedShifts.length - 3} more shifts
                </p>
              )}
            </div>
          )}
        </div>

        {/* Open Shifts */}
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Open Shifts ({openShifts.length})
          </h4>
          {openShifts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No open shifts today</p>
          ) : (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {openShifts.slice(0, 3).map((shift: any) => (
                <div key={shift.id} className="flex items-center justify-between p-2 bg-orange-50 border border-orange-200 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{shift.title}</p>
                    <p className="text-xs text-muted-foreground">{shift.role || 'No role specified'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span className="text-xs">
                      {format(new Date(shift.start_time), 'HH:mm')} - {format(new Date(shift.end_time), 'HH:mm')}
                    </span>
                    <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
                      Open
                    </Badge>
                  </div>
                </div>
              ))}
              {openShifts.length > 3 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{openShifts.length - 3} more open shifts
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentShiftsCard;