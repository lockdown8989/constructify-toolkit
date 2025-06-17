
import { Loader2 } from 'lucide-react';

const RestaurantScheduleLoading = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="text-lg text-gray-700">Loading schedule data...</span>
      <p className="text-sm text-gray-500">Please wait while we retrieve the latest information</p>
    </div>
  );
};

export default RestaurantScheduleLoading;
