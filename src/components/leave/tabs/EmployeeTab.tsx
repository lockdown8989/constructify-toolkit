
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "react-router-dom";
import LeaveRequestForm from "../LeaveRequestForm";
import MobileNavigation from "../../schedule/components/MobileNavigation";
import { useMediaQuery } from "@/hooks/use-media-query";
import LeaveBalanceCard from "../../schedule/LeaveBalanceCard";
import { useEmployeeLeave } from "@/hooks/use-employee-leave";

const EmployeeTab = () => {
  const [activeSection, setActiveSection] = useState<'requests' | 'form'>('requests');
  const isMobile = useMediaQuery("(max-width: 640px)");
  const location = useLocation();
  const { data: leaveData, isLoading } = useEmployeeLeave();

  // Check if we should show the form based on the state passed from navigation
  useEffect(() => {
    if (location.state && location.state.showLeaveRequestForm) {
      setActiveSection('form');
    }
  }, [location.state]);

  const leaveBalance = {
    annual: leaveData?.annual_leave_days || 0,
    sick: leaveData?.sick_leave_days || 0,
    used: 0,
    remaining: leaveData?.annual_leave_days || 0,
  };

  return (
    <div className={isMobile ? 'px-4' : ''}>
      <MobileNavigation
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isMobile={isMobile}
      />
      
      {activeSection === 'requests' && (
        <div className={`${isMobile ? 'space-y-3' : 'space-y-4'}`}>
          <LeaveBalanceCard leaveBalance={leaveBalance} />
          
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className={`grid w-full grid-cols-3 ${isMobile ? 'h-12' : ''}`}>
              <TabsTrigger value="pending" className={`${isMobile ? 'text-sm px-3' : ''}`}>
                Pending
              </TabsTrigger>
              <TabsTrigger value="approved" className={`${isMobile ? 'text-sm px-3' : ''}`}>
                Approved
              </TabsTrigger>
              <TabsTrigger value="rejected" className={`${isMobile ? 'text-sm px-3' : ''}`}>
                Rejected
              </TabsTrigger>
            </TabsList>
            <TabsContent value="pending" className={`${isMobile ? 'mt-3' : 'mt-4'}`}>
              <div className={`text-center ${isMobile ? 'py-6' : 'py-8'} text-muted-foreground`}>
                <p className={isMobile ? 'text-sm' : ''}>
                  You have no pending leave requests
                </p>
              </div>
            </TabsContent>
            <TabsContent value="approved" className={`${isMobile ? 'mt-3' : 'mt-4'}`}>
              <div className={`text-center ${isMobile ? 'py-6' : 'py-8'} text-muted-foreground`}>
                <p className={isMobile ? 'text-sm' : ''}>
                  You have no approved leave requests
                </p>
              </div>
            </TabsContent>
            <TabsContent value="rejected" className={`${isMobile ? 'mt-3' : 'mt-4'}`}>
              <div className={`text-center ${isMobile ? 'py-6' : 'py-8'} text-muted-foreground`}>
                <p className={isMobile ? 'text-sm' : ''}>
                  You have no rejected leave requests
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
      
      {activeSection === 'form' && (
        <div className={isMobile ? 'mt-3' : 'mt-4'}>
          <LeaveRequestForm />
        </div>
      )}
    </div>
  );
};

export default EmployeeTab;
