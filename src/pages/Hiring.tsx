
import React, { useState, useMemo } from 'react';
import HiringStatistics from '@/components/dashboard/HiringStatistics';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useHiringStatistics } from '@/hooks/use-hiring-statistics';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

const Hiring = () => {
  const [activeTab, setActiveTab] = useState<string>('statistics');
  const { 
    data, 
    isLoading, 
    selectedYear, 
    changeYear, 
    availableYears 
  } = useHiringStatistics();

  const calculateYearlyTotals = () => {
    const yearlyData = availableYears.map(year => {
      // Create sample data for each year
      const yearData = year === selectedYear 
        ? data 
        : [
            { name: 'Jan', design: 95, others: 120 },
            { name: 'Feb', design: 85, others: 100 },
            { name: 'Mar', design: 110, others: 95 },
            { name: 'Apr', design: 100, others: 110 },
            { name: 'May', design: 85, others: 130 },
            { name: 'Jun', design: 95, others: 120 },
            { name: 'Jul', design: 80, others: 100 },
            { name: 'Aug', design: 95, others: 80 },
            { name: 'Sep', design: 110, others: 60 },
            { name: 'Oct', design: 90, others: 90 },
            { name: 'Nov', design: 100, others: 115 },
            { name: 'Dec', design: 120, others: 90 },
          ];
      
      // Calculate totals
      const designTotal = yearData.reduce((sum, item) => sum + item.design, 0);
      const othersTotal = yearData.reduce((sum, item) => sum + item.others, 0);
      
      return {
        name: year.toString(),
        design: designTotal,
        others: othersTotal,
        total: designTotal + othersTotal
      };
    });
    
    return yearlyData;
  };

  const yearlyData = useMemo(() => calculateYearlyTotals(), [availableYears, data, selectedYear]);

  return (
    <div className="pt-20 md:pt-24 px-4 sm:px-6 pb-10 animate-fade-in">
      <div className="max-w-[1800px] mx-auto">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-4xl font-bold">Hiring</h1>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="statistics">Monthly Statistics</TabsTrigger>
              <TabsTrigger value="yearly">Yearly Comparison</TabsTrigger>
              <TabsTrigger value="departments">Departments</TabsTrigger>
            </TabsList>
            
            <TabsContent value="statistics" className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <HiringStatistics className="w-full" />
              </div>
            </TabsContent>
            
            <TabsContent value="yearly" className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-medium mb-4">Yearly Hiring Comparison</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ChartContainer
                      config={{
                        design: { color: "#000000" },
                        others: { color: "#FFCB45" },
                        total: { color: "#7C3AED" }
                      }}
                    >
                      <BarChart data={yearlyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ChartTooltip 
                          content={
                            <ChartTooltipContent 
                              indicator="dot"
                            />
                          } 
                        />
                        <Bar dataKey="design" name="Design" fill="#000000" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="others" name="Others" fill="#FFCB45" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </ResponsiveContainer>
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="departments" className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-medium mb-4">Department Hiring Distribution</h2>
                <div className="flex items-center justify-center h-64">
                  <p className="text-gray-500">Department distribution data coming soon</p>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Hiring;
