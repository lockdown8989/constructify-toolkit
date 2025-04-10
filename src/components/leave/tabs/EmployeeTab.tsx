
import React from "react";
import LeaveRequestForm from "@/components/leave/LeaveRequestForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarRange } from "lucide-react";

const EmployeeTab: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto">
      <Card className="border-0 shadow-none">
        <CardHeader className="px-0 pt-0">
          <div className="flex items-center gap-2 mb-2">
            <CalendarRange className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl">Request Leave</CardTitle>
          </div>
          <CardDescription>
            Submit your leave request for approval. Make sure to provide all required details.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <LeaveRequestForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeTab;
