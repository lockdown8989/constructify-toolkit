
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const NoEmployeeState = () => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center p-4">
          <p className="text-destructive font-medium mb-2">Employee Record Not Found</p>
          <p className="text-muted-foreground">Your user account is not linked to an employee record.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NoEmployeeState;
