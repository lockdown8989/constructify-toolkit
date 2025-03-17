
import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

interface ChartData {
  name: string;
  design: number;
  others: number;
}

interface HiringStatisticsProps {
  data: ChartData[];
  className?: string;
}

const HiringStatistics: React.FC<HiringStatisticsProps> = ({ data, className }) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black text-white p-3 rounded-xl text-sm shadow-lg">
          <p className="font-medium mb-1">{`${label}`}</p>
          <p className="text-yellow-400">{`Design: ${payload[0].value}`}</p>
          <p className="text-gray-300">{`Others: ${payload[1].value}`}</p>
        </div>
      );
    }
  
    return null;
  };
  
  return (
    <div className={cn("bg-white rounded-3xl p-6 card-shadow", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-medium">Hiring Statistics</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="inline-block w-3 h-3 rounded-full bg-crextio-accent"></span>
              <span className="text-sm text-gray-500">Others</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-block w-3 h-3 rounded-full bg-black"></span>
              <span className="text-sm text-gray-500">Design</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">2024</span>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="h-64">
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
      </div>
    </div>
  );
};

export default HiringStatistics;
