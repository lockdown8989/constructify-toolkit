import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAccessControl } from "@/hooks/leave/useAccessControl";

const ScheduleRequestsTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("pending");
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [approvedRequests, setApprovedRequests] = useState<any[]>([]);
  const [rejectedRequests, setRejectedRequests] = useState<any[]>([]);
  const { user } = useAuth();
  const { hasManagerAccess } = useAccessControl();
  
  // Use a boolean value directly instead of a function returning a boolean
  const isManagerAccess = hasManagerAccess;

  useEffect(() => {
    if (!user) return;
    
    const fetchRequests = async () => {
      try {
        let query = supabase
          .from('availability_requests')
          .select(`
            *,
            employees (name)
          `);
        
        // If not a manager, only show the user's requests
        if (!isManagerAccess) {
          query = query.eq('employee_id', user.id);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching availability requests:', error);
          return;
        }
        
        if (data) {
          setPendingRequests(data.filter(req => req.status === 'Pending'));
          setApprovedRequests(data.filter(req => req.status === 'Approved'));
          setRejectedRequests(data.filter(req => req.status === 'Rejected'));
        }
      } catch (err) {
        console.error('Exception fetching availability requests:', err);
      }
    };
    
    fetchRequests();
    
    // Set up realtime subscription for updates
    const subscription = supabase
      .channel('availability-requests-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'availability_requests' 
        }, 
        () => {
          fetchRequests();
        }
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [user, isManagerAccess]);

  const handleUpdateRequestStatus = async (requestId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('availability_requests')
        .update({ status: newStatus })
        .eq('id', requestId);
      
      if (error) {
        console.error('Error updating request status:', error);
        return;
      }
      
      // Optimistically update the state
      setPendingRequests(prevRequests =>
        prevRequests.filter(req => req.id !== requestId)
      );
      
      if (newStatus === 'Approved') {
        setApprovedRequests(prevRequests => [
          ...prevRequests,
          ...pendingRequests.filter(req => req.id === requestId)
        ]);
      } else if (newStatus === 'Rejected') {
        setRejectedRequests(prevRequests => [
          ...prevRequests,
          ...pendingRequests.filter(req => req.id === requestId)
        ]);
      }
    } catch (err) {
      console.error('Exception updating request status:', err);
    }
  };

  return (
    <Tabs defaultValue="pending" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="pending">Pending ({pendingRequests.length})</TabsTrigger>
        {isManagerAccess && (
          <>
            <TabsTrigger value="approved">Approved ({approvedRequests.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedRequests.length})</TabsTrigger>
          </>
        )}
      </TabsList>

      <TabsContent value="pending" className="space-y-4">
        {pendingRequests.length > 0 ? (
          pendingRequests.map(request => (
            <div key={request.id} className="border rounded-md p-4">
              <p>Employee: {request.employees?.name}</p>
              <p>Date: {request.date}</p>
              <p>Start Time: {request.start_time}</p>
              <p>End Time: {request.end_time}</p>
              <p>Reason: {request.reason}</p>
              {isManagerAccess && (
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => handleUpdateRequestStatus(request.id, 'Approved')}
                  >
                    Approve
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => handleUpdateRequestStatus(request.id, 'Rejected')}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No pending requests.</p>
        )}
      </TabsContent>

      {isManagerAccess && (
        <>
          <TabsContent value="approved" className="space-y-4">
            {approvedRequests.length > 0 ? (
              approvedRequests.map(request => (
                <div key={request.id} className="border rounded-md p-4">
                  <p>Employee: {request.employees?.name}</p>
                  <p>Date: {request.date}</p>
                  <p>Start Time: {request.start_time}</p>
                  <p>End Time: {request.end_time}</p>
                  <p>Reason: {request.reason}</p>
                  <p>Status: Approved</p>
                </div>
              ))
            ) : (
              <p>No approved requests.</p>
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {rejectedRequests.length > 0 ? (
              rejectedRequests.map(request => (
                <div key={request.id} className="border rounded-md p-4">
                  <p>Employee: {request.employees?.name}</p>
                  <p>Date: {request.date}</p>
                  <p>Start Time: {request.start_time}</p>
                  <p>End Time: {request.end_time}</p>
                  <p>Reason: {request.reason}</p>
                  <p>Status: Rejected</p>
                </div>
              ))
            ) : (
              <p>No rejected requests.</p>
            )}
          </TabsContent>
        </>
      )}
    </Tabs>
  );
};

export default ScheduleRequestsTab;
