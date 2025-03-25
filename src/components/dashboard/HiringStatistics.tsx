
import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useHiringStatistics, HiringStatisticsData } from '@/hooks/use-hiring-statistics';

interface HiringStatisticsProps {
  className?: string;
}

const HiringStatistics: React.FC<HiringStatisticsProps> = ({ className }) => {
  const {
    data,
    isLoading,
    selectedYear,
    changeYear,
    availableYears
  } = useHiringStatistics();

  const handlePreviousYear = () => {
    const currentIndex = availableYears.indexOf(selectedYear);
    if (currentIndex > 0) {
      changeYear(availableYears[currentIndex - 1]);
    }
  };

  const handleNextYear = () => {
    const currentIndex = availableYears.indexOf(selectedYear);
    if (currentIndex < availableYears.length - 1) {
      changeYear(availableYears[currentIndex + 1]);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black text-white p-3 rounded-xl text-sm shadow-lg">
          <p className="font-medium mb-1">{`${label} ${selectedYear}`}</p>
          <p className="text-yellow-400">{`Design: ${payload[0].value}`}</p>
          <p className="text-gray-300">{`Others: ${payload[1].value}`}</p>
        </div>
      );
    }
  
    return null;
  };

  const canGoBack = availableYears.indexOf(selectedYear) > 0;
  const canGoForward = availableYears.indexOf(selectedYear) < availableYears.length - 1;
  
  return (
    <div className={cn("bg-white rounded-3xl p-6 card-shadow", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-medium">Hiring Statistics</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="inline-block w-3 h-3 rounded-full bg-teampulse-accent"></span>
              <span className="text-sm text-gray-500">Others</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-block w-3 h-3 rounded-full bg-black"></span>
              <span className="text-sm text-gray-500">Design</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              className={cn(
                "w-8 h-8 flex items-center justify-center rounded-full text-gray-600 transition-colors",
                canGoBack 
                  ? "bg-gray-100 hover:bg-gray-200" 
                  : "bg-gray-50 text-gray-300 cursor-not-allowed"
              )}
              onClick={handlePreviousYear}
              disabled={!canGoBack}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium">{selectedYear}</span>
            <button 
              className={cn(
                "w-8 h-8 flex items-center justify-center rounded-full text-gray-600 transition-colors",
                canGoForward 
                  ? "bg-gray-100 hover:bg-gray-200" 
                  : "bg-gray-50 text-gray-300 cursor-not-allowed"
              )}
              onClick={handleNextYear}
              disabled={!canGoForward}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="h-64">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-black rounded-full"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 10, left: 10, bottom: 10 }}>
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B6B6B' }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B6B6B' }}
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="others"
                stroke="#FFCB45"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: '#FFCB45', strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="design"
                stroke="#000000"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
                activeDot={{ r: 6, fill: '#000000', strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default HiringStatistics;
