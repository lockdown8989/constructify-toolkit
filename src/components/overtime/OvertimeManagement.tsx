import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, AlertTriangle, Users, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import OvertimeApprovalCard from './OvertimeApprovalCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface OvertimeData {
  id: string;
  employee_id: string;
  overtime_minutes: number;
  overtime_status: string;
  check_in: string;
  date: string;
  employees?: {
    name: string;
    job_title: string;
  };
}

const OvertimeManagement: React.FC = () => {
  const [overtimeData, setOvertimeData] = useState<OvertimeData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOvertimeData = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          id,
          employee_id,
          overtime_minutes,
          overtime_status,
          check_in,
          date,
          employees!inner(name, job_title)
        `)
        .gt('overtime_minutes', 0)
        .order('date', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // Transform data to match our interface
      const transformedData = (data || []).map(item => ({
        ...item,
        employees: item.employees?.[0] || { name: 'Unknown', job_title: 'Unknown' }
      }));
      
      setOvertimeData(transformedData);
    } catch (error) {
      console.error('Error fetching overtime data:', error);
      toast({
        title: "Error",
        description: "Failed to load overtime data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOvertimeData();
  }, []);

  const pendingOvertimes = overtimeData.filter(item => item.overtime_status === 'pending');
  const approvedOvertimes = overtimeData.filter(item => item.overtime_status === 'approved');
  const rejectedOvertimes = overtimeData.filter(item => item.overtime_status === 'rejected');

  const totalOvertimeMinutes = overtimeData
    .filter(item => item.overtime_status === 'approved')
    .reduce((sum, item) => sum + item.overtime_minutes, 0);

  const totalOvertimeHours = Math.round(totalOvertimeMinutes / 60 * 10) / 10;

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Overtime Management</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{pendingOvertimes.length}</p>
                <p className="text-sm text-gray-600">Pending Approval</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{new Set(overtimeData.map(item => item.employee_id)).size}</p>
                <p className="text-sm text-gray-600">Employees with Overtime</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{totalOvertimeHours}h</p>
                <p className="text-sm text-gray-600">Total Approved Hours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{overtimeData.length}</p>
                <p className="text-sm text-gray-600">Total Overtime Records</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overtime Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Pending ({pendingOvertimes.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Approved ({approvedOvertimes.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Rejected ({rejectedOvertimes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingOvertimes.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Overtime</h3>
                <p className="text-gray-600">All overtime requests have been processed.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingOvertimes.map((overtime) => (
                <OvertimeApprovalCard
                  key={overtime.id}
                  attendance={overtime}
                  onApprovalUpdate={fetchOvertimeData}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          {approvedOvertimes.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Approved Overtime</h3>
                <p className="text-gray-600">No overtime has been approved yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {approvedOvertimes.map((overtime) => (
                <OvertimeApprovalCard
                  key={overtime.id}
                  attendance={overtime}
                  onApprovalUpdate={fetchOvertimeData}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          {rejectedOvertimes.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Rejected Overtime</h3>
                <p className="text-gray-600">No overtime has been rejected.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {rejectedOvertimes.map((overtime) => (
                <OvertimeApprovalCard
                  key={overtime.id}
                  attendance={overtime}
                  onApprovalUpdate={fetchOvertimeData}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OvertimeManagement;