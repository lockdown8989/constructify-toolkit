
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, Calendar } from 'lucide-react';
import { useGDPR } from '@/hooks/use-gdpr';
import { format } from 'date-fns';

const DataProcessingLog = () => {
  const { processingLogs } = useGDPR();

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create': return 'bg-green-100 text-green-800';
      case 'update': return 'bg-blue-100 text-blue-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'export': return 'bg-purple-100 text-purple-800';
      case 'anonymize': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-purple-600" />
          Data Processing Activity
        </CardTitle>
        <CardDescription>
          View all activities involving your personal data for transparency and audit purposes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {processingLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No data processing activities recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {processingLogs.map((log) => (
                <div key={log.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getActionColor(log.action_type)}>
                        {log.action_type}
                      </Badge>
                      <span className="text-sm font-medium">{log.table_name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm')}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Legal basis: <span className="capitalize">{log.legal_basis.replace('_', ' ')}</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default DataProcessingLog;
