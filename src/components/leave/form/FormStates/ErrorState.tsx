
import React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const ErrorState = () => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center p-6 space-y-4">
          <div className="flex justify-center">
            <AlertCircle className="h-16 w-16 text-red-500" />
          </div>
          <h3 className="text-xl font-medium">Request Failed</h3>
          <p className="text-muted-foreground">
            There was a problem submitting your leave request.
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ErrorState;
