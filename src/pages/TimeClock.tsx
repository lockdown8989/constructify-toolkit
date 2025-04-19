
import TimeClockWidget from "@/components/schedule/TimeClockWidget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

const TimeClock = () => {
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-6 w-6" />
            Time Clock
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TimeClockWidget />
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeClock;
