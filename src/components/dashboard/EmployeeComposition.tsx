
import React, { useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { MapPin, Users } from 'lucide-react';
import { useEmployeeComposition } from '@/hooks/use-employee-composition';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface EmployeeCompositionProps {
  className?: string;
}

const EmployeeComposition: React.FC<EmployeeCompositionProps> = ({ className }) => {
  const { data: compositionData, isLoading, error } = useEmployeeComposition();
  const queryClient = useQueryClient();
  
  // Set up real-time subscription for employee composition changes
  useEffect(() => {
    const channel = supabase
      .channel('employee-composition-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'employee_composition'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['employee-composition'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
  
  // Display error message if data loading fails
  if (error) {
    return (
      <div className={cn("bg-white rounded-3xl p-6 card-shadow h-72 flex items-center justify-center", className)}>
        <div className="text-center">
          <p className="text-red-500 font-medium mb-2">Failed to load employee data</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['employee-composition'] })}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }
  
  if (isLoading || !compositionData) {
    return (
      <div className={cn("bg-white rounded-3xl p-6 card-shadow h-72 flex items-center justify-center", className)}>
        <div className="space-y-4 w-full">
          <Skeleton className="h-8 w-1/3" />
          <div className="flex justify-center">
            <Skeleton className="h-40 w-40 rounded-full" />
          </div>
          <div className="flex justify-around w-full">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
      </div>
    );
  }
  
  const { total_employees, male_percentage, female_percentage } = compositionData;
  
  const data = [
    { name: 'Female', value: female_percentage || 0 },
    { name: 'Male', value: male_percentage || 0 }
  ];
  
  const COLORS = ['#FFCB45', '#000000'];
  
  return (
    <div className={cn("bg-white rounded-3xl p-6 card-shadow", className)}>
      <h3 className="text-xl font-medium mb-4">Employee Composition</h3>
      
      <div className="flex flex-col items-center py-2">
        <div className="relative h-40 w-full mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                startAngle={90}
                endAngle={-270}
                paddingAngle={0}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          
          <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
            <span className="text-4xl font-semibold">{total_employees}</span>
            <span className="text-sm text-gray-500">Total</span>
          </div>
        </div>
        
        <div className="flex justify-around w-full">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-3 h-3 rounded-full bg-[#FFCB45]"></span>
            <span className="text-lg font-medium">{Math.round(female_percentage || 0)}%</span>
            <MapPin className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-block w-3 h-3 rounded-full bg-black"></span>
            <span className="text-lg font-medium">{Math.round(male_percentage || 0)}%</span>
            <Users className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeComposition;
