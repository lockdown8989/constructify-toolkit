import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import type { HiringStatistic } from '@/types/supabase';

export type HiringStatisticsData = {
  name: string;
  design: number;
  others: number;
};

export function useHiringStatistics(year: number = new Date().getFullYear()) {
  const { toast } = useToast();
  const [selectedYear, setSelectedYear] = useState<number>(year);

  const transformData = (data: HiringStatistic[]): HiringStatisticsData[] => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    const chartData: HiringStatisticsData[] = months.map(month => ({
      name: month,
      design: 0,
      others: 0
    }));
    
    data.forEach(item => {
      const monthIndex = months.indexOf(item.month);
      if (monthIndex >= 0) {
        chartData[monthIndex].design = item.design_count;
        chartData[monthIndex].others = item.others_count;
      }
    });
    
    return chartData;
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['hiring-statistics', selectedYear],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('hiring_statistics')
          .select('*')
          .eq('year', selectedYear)
          .order('month', { ascending: true });
        
        if (error) {
          throw error;
        }
        
        return transformData(data as HiringStatistic[]);
      } catch (err) {
        console.error('Error fetching hiring statistics:', err);
        toast({
          title: "Failed to fetch hiring statistics",
          description: err instanceof Error ? err.message : "Unknown error occurred",
          variant: "destructive",
        });
        
        return getSampleData();
      }
    },
  });

  const addHiringStatistic = async (newData: Omit<HiringStatistic, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('hiring_statistics')
        .upsert([newData], { 
          onConflict: 'month,year',
          ignoreDuplicates: false 
        });
      
      if (error) throw error;
      
      toast({
        title: "Statistics updated",
        description: "Hiring statistics have been successfully updated",
      });
      
      return data;
    } catch (err) {
      console.error('Error adding hiring statistic:', err);
      toast({
        title: "Failed to update statistics",
        description: err instanceof Error ? err.message : "Unknown error occurred",
        variant: "destructive",
      });
      throw err;
    }
  };

  const changeYear = (year: number) => {
    setSelectedYear(year);
  };

  const getSampleData = (): HiringStatisticsData[] => {
    return [
      { name: 'Jan', design: 120, others: 130 },
      { name: 'Feb', design: 100, others: 110 },
      { name: 'Mar', design: 140, others: 120 },
      { name: 'Apr', design: 120, others: 140 },
      { name: 'May', design: 90, others: 160 },
      { name: 'Jun', design: 120, others: 140 },
      { name: 'Jul', design: 90, others: 110 },
      { name: 'Aug', design: 110, others: 90 },
      { name: 'Sep', design: 130, others: 70 },
      { name: 'Oct', design: 110, others: 100 },
      { name: 'Nov', design: 120, others: 130 },
      { name: 'Dec', design: 140, others: 110 },
    ];
  };

  return {
    data: data || getSampleData(),
    isLoading,
    error,
    selectedYear,
    changeYear,
    addHiringStatistic,
    availableYears: [2022, 2023, 2024],
  };
}
