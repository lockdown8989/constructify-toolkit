
import { cn } from '@/lib/utils';
import { Schedule } from '@/types/supabase/schedules';

export const useStatusStyles = () => {
  const getCardStyles = (status: Schedule['status']) => {
    return cn(
      "p-4 rounded-lg border transition-all hover:shadow-sm",
      status === 'confirmed' ? "border-green-200 bg-green-50" :
      status === 'pending' ? "border-orange-200 bg-orange-50" :
      "border-gray-200 bg-white"
    );
  };

  const getDateBoxStyles = (status: Schedule['status']) => {
    return cn(
      "w-14 h-14 rounded-lg flex flex-col items-center justify-center",
      status === 'confirmed' ? "bg-green-100 text-green-700" :
      status === 'pending' ? "bg-orange-100 text-orange-700" :
      "bg-gray-100 text-gray-700"
    );
  };

  return {
    getCardStyles,
    getDateBoxStyles,
  };
};
