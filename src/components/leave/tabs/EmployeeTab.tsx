
import React, { useEffect, useState } from "react";
import LeaveRequestForm from "@/components/leave/LeaveRequestForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Clock, AlertCircle, CheckCircle, XCircle, RefreshCw, Calendar, History } from "lucide-react";
import { format } from "date-fns";
import { LeaveEvent } from "@/hooks/leave/leave-types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDate } from "@/utils/format";
import LeaveHistoryDialog from "../LeaveHistoryDialog";

const EmployeeTab: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showNewRequestForm, setShowNewRequestForm] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveEvent | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Fetch ALL leave requests for the current user, not just pending ones
  const { data: leaveRequests, isLoading, error } = useQuery({
    queryKey: ['employee-leave-requests', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // First get the employee ID for the current user
      const { data: employeeData } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (!employeeData) return [];
      
      // Then fetch ALL leave requests for that employee with complete audit logs
      const { data, error } = await supabase
        .from('leave_calendar')
        .select(`
          *,
          employees:employee_id (
            name
          )
        `)
        .eq('employee_id', employeeData.id)
        .order('start_date', { ascending: false }); // Order by start_date descending to show newest first
      
      if (error) {
        console.error("Error fetching leave requests:", error);
        throw error;
      }
      
      console.log("Fetched leave requests:", data);
      return data as LeaveEvent[];
    },
    enabled: !!user,
  });

  const refreshLeaveRequests = () => {
    setIsRefreshing(true);
    queryClient.invalidateQueries({ queryKey: ['employee-leave-requests'] })
      .then(() => {
        setTimeout(() => setIsRefreshing(false), 500); // Add slight delay for feedback
      });
  };

  // Setup realtime subscription to leave_calendar changes
  useEffect(() => {
    if (!user) return;
    
    console.log("Setting up realtime subscription for leave requests updates");
    
    const channel = supabase
      .channel('employee-leave-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leave_calendar'
        },
        (payload) => {
          console.log("Realtime update for leave request:", payload);
          queryClient.invalidateQueries({ queryKey: ['employee-leave-requests'] });
        }
      )
      .subscribe();
    
    return () => {
      console.log("Cleaning up realtime subscription for leave requests");
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'Approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'Approved': return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'Rejected': return 'bg-red-100 text-red-800 hover:bg-red-200';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const formatAuditInfo = (leaveRequest: LeaveEvent) => {
    if (!leaveRequest.audit_log?.length) return null;
    
    // Find the last status change entry
    const lastStatusChange = [...leaveRequest.audit_log]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .find(log => log.status === leaveRequest.status);
      
    if (!lastStatusChange) return null;
    
    const date = new Date(lastStatusChange.timestamp);
    const formattedDate = format(date, 'dd.MM.yyyy HH:mm');
    
    return (
      <div className="text-xs text-gray-500 mt-2">
        <span>
          {leaveRequest.status} by {lastStatusChange.reviewer_name || 'System'} on {formattedDate}
        </span>
      </div>
    );
  };
  
  // Group leave requests by status
  const pendingRequests = leaveRequests?.filter(req => req.status === 'Pending') || [];
  const approvedRequests = leaveRequests?.filter(req => req.status === 'Approved') || [];
  const rejectedRequests = leaveRequests?.filter(req => req.status === 'Rejected') || [];

  const handleShowHistory = (leave: LeaveEvent) => {
    setSelectedLeave(leave);
    setShowHistory(true);
  };

  return (
    <div className="space-y-6">
      {!showNewRequestForm && (
        <div className="flex justify-between items-center">
          <Button 
            variant="default" 
            onClick={() => setShowNewRequestForm(true)}
          >
            + New Leave Request
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={refreshLeaveRequests}
            disabled={isRefreshing}
            className="transition-all duration-200"
            title="Refresh leave requests"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      )}
      
      {showNewRequestForm ? (
        <div className="space-y-4">
          <Button 
            variant="outline" 
            onClick={() => setShowNewRequestForm(false)}
            className="mb-4"
          >
            ← Back to Requests
          </Button>
          <div className="max-w-md mx-auto">
            <LeaveRequestForm />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="text-xl font-medium">Your Leave Requests</h2>
          
          {isLoading && (
            <p className="text-center text-muted-foreground py-4">Loading your requests...</p>
          )}
          
          {error && (
            <Card className="border-red-200">
              <CardContent className="pt-4">
                <div className="flex items-center text-red-600">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <p>Error loading requests. Please try again.</p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {!isLoading && !error && leaveRequests?.length === 0 && (
            <Card className="border-dashed border-gray-300 bg-gray-50">
              <CardContent className="py-6">
                <div className="text-center text-muted-foreground">
                  <p>You don't have any leave requests.</p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Pending Requests Section */}
          {pendingRequests.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-yellow-700 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Pending Requests
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {pendingRequests.map((request) => (
                  <Card key={request.id} className="overflow-hidden">
                    <div className="h-2 bg-yellow-400"></div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{request.type} Leave</CardTitle>
                        <Badge className={getStatusColor(request.status)} variant="outline">
                          <span className="flex items-center">
                            {getStatusIcon(request.status)}
                            <span className="ml-1">{request.status}</span>
                          </span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">From:</span>
                          <span className="font-medium">{format(new Date(request.start_date), 'dd.MM.yyyy')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">To:</span>
                          <span className="font-medium">{format(new Date(request.end_date), 'dd.MM.yyyy')}</span>
                        </div>
                        {request.notes && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-sm text-muted-foreground mb-1">Notes:</p>
                            <p className="text-sm">{request.notes}</p>
                          </div>
                        )}
                        {formatAuditInfo(request)}
                        <Button 
                          variant="ghost" 
                          className="mt-2 text-xs flex items-center text-gray-600"
                          size="sm"
                          onClick={() => handleShowHistory(request)}
                        >
                          <History className="h-3.5 w-3.5 mr-1.5" />
                          View History
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {/* Approved Requests Section */}
          {approvedRequests.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-green-700 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Approved Requests
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {approvedRequests.map((request) => (
                  <Card key={request.id} className="overflow-hidden">
                    <div className="h-2 bg-green-500"></div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{request.type} Leave</CardTitle>
                        <Badge className={getStatusColor(request.status)} variant="outline">
                          <span className="flex items-center">
                            {getStatusIcon(request.status)}
                            <span className="ml-1">{request.status}</span>
                          </span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">From:</span>
                          <span className="font-medium">{format(new Date(request.start_date), 'dd.MM.yyyy')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">To:</span>
                          <span className="font-medium">{format(new Date(request.end_date), 'dd.MM.yyyy')}</span>
                        </div>
                        {request.notes && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-sm text-muted-foreground mb-1">Notes:</p>
                            <p className="text-sm">{request.notes}</p>
                          </div>
                        )}
                        {formatAuditInfo(request)}
                        <Button 
                          variant="ghost" 
                          className="mt-2 text-xs flex items-center text-gray-600"
                          size="sm"
                          onClick={() => handleShowHistory(request)}
                        >
                          <History className="h-3.5 w-3.5 mr-1.5" />
                          View History
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {/* Rejected Requests Section */}
          {rejectedRequests.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-red-700 flex items-center">
                <XCircle className="h-4 w-4 mr-2" />
                Rejected Requests
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {rejectedRequests.map((request) => (
                  <Card key={request.id} className="overflow-hidden">
                    <div className="h-2 bg-red-500"></div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{request.type} Leave</CardTitle>
                        <Badge className={getStatusColor(request.status)} variant="outline">
                          <span className="flex items-center">
                            {getStatusIcon(request.status)}
                            <span className="ml-1">{request.status}</span>
                          </span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">From:</span>
                          <span className="font-medium">{format(new Date(request.start_date), 'dd.MM.yyyy')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">To:</span>
                          <span className="font-medium">{format(new Date(request.end_date), 'dd.MM.yyyy')}</span>
                        </div>
                        {request.notes && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-sm text-muted-foreground mb-1">Notes:</p>
                            <p className="text-sm">{request.notes}</p>
                          </div>
                        )}
                        {formatAuditInfo(request)}
                        <Button 
                          variant="ghost" 
                          className="mt-2 text-xs flex items-center text-gray-600"
                          size="sm"
                          onClick={() => handleShowHistory(request)}
                        >
                          <History className="h-3.5 w-3.5 mr-1.5" />
                          View History
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Leave History Dialog */}
      {selectedLeave && (
        <LeaveHistoryDialog 
          leave={selectedLeave} 
          isOpen={showHistory} 
          onClose={() => setShowHistory(false)} 
        />
      )}
    </div>
  );
};

export default EmployeeTab;
