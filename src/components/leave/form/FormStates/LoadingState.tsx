
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const LoadingState = () => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-center">
          <p>Loading employee data...</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadingState;
