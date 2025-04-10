
import React, { useEffect, useState } from "react";
import LeaveRequestForm from "@/components/leave/LeaveRequestForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Clock, AlertCircle, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { LeaveEvent } from "@/hooks/leave/leave-types";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const EmployeeTab: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showNewRequestForm, setShowNewRequestForm] = useState(false);

  // Fetch pending requests for the current user
  const { data: pendingRequests, isLoading, error } = useQuery({
    queryKey: ['pending-leave-requests', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // First get the employee ID for the current user
      const { data: employeeData } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (!employeeData) return [];
      
      // Then fetch pending leave requests for that employee
      const { data, error } = await supabase
        .from('leave_calendar')
        .select('*')
        .eq('employee_id', employeeData.id)
        .eq('status', 'Pending')
        .order('start_date', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      return data as LeaveEvent[];
    },
    enabled: !!user,
  });

  const refreshPendingRequests = () => {
    queryClient.invalidateQueries({ queryKey: ['pending-leave-requests'] });
  };

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
            onClick={refreshPendingRequests}
            title="Refresh pending requests"
          >
            <RefreshCw className="h-4 w-4" />
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
        <div className="space-y-4">
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
          
          {!isLoading && !error && pendingRequests?.length === 0 && (
            <Card className="border-dashed border-gray-300 bg-gray-50">
              <CardContent className="py-6">
                <div className="text-center text-muted-foreground">
                  <p>You don't have any pending leave requests.</p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {pendingRequests && pendingRequests.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {pendingRequests.map((request) => (
                <Card key={request.id} className="overflow-hidden">
                  <div className={`h-2 ${request.status === 'Pending' ? 'bg-yellow-400' : request.status === 'Approved' ? 'bg-green-500' : 'bg-red-500'}`}></div>
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
                        <span className="font-medium">{format(new Date(request.start_date), 'PPP')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">To:</span>
                        <span className="font-medium">{format(new Date(request.end_date), 'PPP')}</span>
                      </div>
                      {request.notes && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-sm text-muted-foreground mb-1">Notes:</p>
                          <p className="text-sm">{request.notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeTab;
