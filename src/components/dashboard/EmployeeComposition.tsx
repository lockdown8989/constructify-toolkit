
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { MapPin, Users } from 'lucide-react';
import { useEmployeeComposition } from '@/hooks/use-employee-composition';

interface EmployeeCompositionProps {
  className?: string;
}

const EmployeeComposition: React.FC<EmployeeCompositionProps> = ({ className }) => {
  const { data: compositionData, isLoading } = useEmployeeComposition();
  
  if (isLoading || !compositionData) {
    return (
      <div className={cn("bg-white rounded-3xl p-6 card-shadow h-72 flex items-center justify-center", className)}>
        <div className="text-gray-500">Loading employee composition data...</div>
      </div>
    );
  }
  
  const { total_employees, male_percentage, female_percentage } = compositionData;
  
  const data = [
    { name: 'Female', value: female_percentage },
    { name: 'Male', value: male_percentage }
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
            <span className="inline-block w-3 h-3 rounded-full bg-crextio-accent"></span>
            <span className="text-lg font-medium">{female_percentage}%</span>
            <MapPin className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-block w-3 h-3 rounded-full bg-black"></span>
            <span className="text-lg font-medium">{male_percentage}%</span>
            <Users className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeComposition;
