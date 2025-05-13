
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

const NoEmployeeState = () => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center p-6 space-y-3">
          <div className="flex justify-center">
            <AlertCircle className="h-10 w-10 text-amber-500" />
          </div>
          <h3 className="font-medium text-lg">Employee Record Not Found</h3>
          <p className="text-muted-foreground">
            Your user account is not linked to an employee record. Please contact HR for assistance.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NoEmployeeState;
