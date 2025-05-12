
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarPlus, ChevronRight } from "lucide-react";
import LeaveRequestForm from "@/components/leave/LeaveRequestForm";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileNavigation from "@/components/schedule/components/MobileNavigation";

const EmployeeTab = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeSection, setActiveSection] = useState<'requests' | 'form'>('requests');

  const handleRequestLeave = () => {
    if (isMobile) {
      setActiveSection('form');
    } else {
      navigate("/leave-management", { state: { initialView: "calendar" } });
    }
  };

  return (
    <div className="space-y-6">
      {isMobile && (
        <MobileNavigation 
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          isMobile={isMobile}
        />
      )}

      {(!isMobile || activeSection === 'requests') && (
        <>
          <div className="flex flex-col sm:flex-row justify-between mb-4 items-start sm:items-center gap-4">
            <h2 className="text-xl font-semibold">My Leave Requests</h2>
            <Button 
              onClick={handleRequestLeave}
              className="w-full sm:w-auto flex items-center gap-2"
            >
              <CalendarPlus className="h-4 w-4" />
              Request Leave
            </Button>
          </div>
          
          <div className="bg-muted/40 p-8 rounded-lg text-center">
            <h3 className="text-lg font-medium mb-2">No Leave Requests</h3>
            <p className="text-muted-foreground mb-4">
              You haven't submitted any leave requests yet.
            </p>
            <Button 
              onClick={handleRequestLeave}
              variant="outline" 
              className="flex items-center gap-2"
            >
              <CalendarPlus className="h-4 w-4" />
              Request Leave
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </>
      )}

      {(isMobile && activeSection === 'form') && (
        <div className="pt-2">
          <LeaveRequestForm />
        </div>
      )}
    </div>
  );
};

export default EmployeeTab;
