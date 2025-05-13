
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useShiftResponse } from "@/hooks/use-shift-response";
import { Schedule } from "@/types/schedule"; // We'll ensure this type exists

interface ShiftResponseActionsProps {
  shift: Schedule;
  onComplete?: () => void;
}

export const ShiftResponseActions = ({ shift, onComplete }: ShiftResponseActionsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { respondToShift } = useShiftResponse();

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      await respondToShift(shift.id, 'employee_accepted');
      onComplete?.();
    } catch (error) {
      console.error("Failed to accept shift:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = async () => {
    setIsLoading(true);
    try {
      await respondToShift(shift.id, 'employee_rejected');
      onComplete?.();
    } catch (error) {
      console.error("Failed to decline shift:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-end space-x-2">
      <Button
        variant="outline"
        onClick={handleDecline}
        disabled={isLoading}
      >
        Decline
      </Button>
      <Button
        onClick={handleAccept}
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : "Accept"}
      </Button>
    </div>
  );
};
