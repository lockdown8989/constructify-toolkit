
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";

// Import our new main component
import EnhancedCalendarMain from "./enhanced-calendar/EnhancedCalendarMain";

const EnhancedCalendarView: React.FC = () => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>
          Color-coded employee leave calendar
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <EnhancedCalendarMain />
      </CardContent>
    </Card>
  );
};

export default EnhancedCalendarView;
