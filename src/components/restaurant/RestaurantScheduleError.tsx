
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const RestaurantScheduleError = () => {
  return (
    <div className="container py-6 sm:py-8 max-w-[1400px] px-3 md:px-6 mx-auto">
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center gap-2">
          <AlertCircle className="h-10 w-10 text-red-500" />
          <h3 className="text-lg font-semibold mt-2">Error Loading Restaurant Schedule</h3>
          <p className="text-gray-600 max-w-md mx-auto mb-4">
            There was an error loading the restaurant schedule. Please try refreshing the page.
          </p>
          <Button variant="default" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default RestaurantScheduleError;
