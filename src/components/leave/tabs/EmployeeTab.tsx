
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "react-router-dom";
import LeaveRequestForm from "../LeaveRequestForm";
import MobileNavigation from "../../schedule/components/MobileNavigation";
import { useMediaQuery } from "@/hooks/use-media-query";

const EmployeeTab = () => {
  const [activeSection, setActiveSection] = useState<'requests' | 'form'>('requests');
  const isMobile = useMediaQuery("(max-width: 640px)");
  const location = useLocation();

  // Check if we should show the form based on the state passed from navigation
  useEffect(() => {
    if (location.state && location.state.showLeaveRequestForm) {
      setActiveSection('form');
    }
  }, [location.state]);

  return (
    <div>
      <MobileNavigation
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isMobile={isMobile}
      />
      
      {activeSection === 'requests' && (
        <div className="space-y-4">
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
            <TabsContent value="pending" className="mt-4">
              <p className="text-center py-8 text-muted-foreground">
                You have no pending leave requests
              </p>
            </TabsContent>
            <TabsContent value="approved" className="mt-4">
              <p className="text-center py-8 text-muted-foreground">
                You have no approved leave requests
              </p>
            </TabsContent>
            <TabsContent value="rejected" className="mt-4">
              <p className="text-center py-8 text-muted-foreground">
                You have no rejected leave requests
              </p>
            </TabsContent>
          </Tabs>
        </div>
      )}
      
      {activeSection === 'form' && <LeaveRequestForm />}
    </div>
  );
};

export default EmployeeTab;
