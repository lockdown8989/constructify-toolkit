
import React from "react";
import { CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const SuccessState = () => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center p-6 space-y-4">
          <div className="flex justify-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h3 className="text-xl font-medium">Leave Request Submitted</h3>
          <p className="text-muted-foreground">
            Your leave request has been submitted successfully and is pending approval.
          </p>
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertTitle>Waiting for confirmation</AlertTitle>
            <AlertDescription>
              Your request has been sent to your manager for review. 
              You'll receive a notification when it's approved or rejected.
            </AlertDescription>
          </Alert>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            Submit Another Request
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SuccessState;
