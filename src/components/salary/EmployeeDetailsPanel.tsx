
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Employee } from '@/hooks/use-employees';

interface EmployeeDetailsPanelProps {
  employee: Employee;
  onBack: () => void;
}

const EmployeeDetailsPanel: React.FC<EmployeeDetailsPanelProps> = ({
  employee,
  onBack
}) => {
  const isMobile = useIsMobile();
  
  // Mock data for statistics
  const statisticsData = {
    businessTrips: 58,
    sickness: 24
  };
  
  // Mock data for documents
  const documentsData = [
    { type: 'Contract', size: '23 mb' },
    { type: 'Resume', size: '76 kb' }
  ];
  
  return (
    <Card className="rounded-3xl overflow-hidden">
      {/* Header with background image */}
      <div className="relative h-44 bg-gradient-to-r from-amber-200 to-amber-500 overflow-hidden">
        {isMobile && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute top-2 left-2 text-white bg-black/20 hover:bg-black/30"
            onClick={onBack}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        )}
        
        {/* Employee avatar and info */}
        <div className="absolute -bottom-12 w-full flex flex-col items-center">
          <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white">
            {employee.avatar ? (
              <img 
                src={employee.avatar} 
                alt={employee.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-600 text-xl">
                {employee.name.charAt(0)}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Employee details */}
      <div className="pt-16 px-6 pb-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold">{employee.name}</h2>
          <p className="text-gray-500">{employee.job_title}</p>
        </div>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium mb-3">Basic Information</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-6 h-6 mr-3 flex-shrink-0 text-gray-400">🎂</div>
                <div className="text-sm font-medium w-28">Birthday</div>
                <div className="text-sm text-gray-600">26 September 1998</div>
              </div>
              
              <div className="flex items-center">
                <div className="w-6 h-6 mr-3 flex-shrink-0 text-gray-400">📱</div>
                <div className="text-sm font-medium w-28">Phone number</div>
                <div className="text-sm text-gray-600">+33 170 36 39 50</div>
              </div>
              
              <div className="flex items-center">
                <div className="w-6 h-6 mr-3 flex-shrink-0 text-gray-400">✉️</div>
                <div className="text-sm font-medium w-28">E-Mail</div>
                <div className="text-sm text-gray-600 truncate">{employee.name.toLowerCase().replace(' ', '')}@company.com</div>
              </div>
              
              <div className="flex items-center">
                <div className="w-6 h-6 mr-3 flex-shrink-0 text-gray-400">🌍</div>
                <div className="text-sm font-medium w-28">Citizenship</div>
                <div className="text-sm text-gray-600">{employee.location || "United States"}</div>
              </div>
              
              <div className="flex items-center">
                <div className="w-6 h-6 mr-3 flex-shrink-0 text-gray-400">🏙️</div>
                <div className="text-sm font-medium w-28">City</div>
                <div className="text-sm text-gray-600">{employee.location || "New York"}</div>
              </div>
              
              <div className="flex items-center">
                <div className="w-6 h-6 mr-3 flex-shrink-0 text-gray-400">📍</div>
                <div className="text-sm font-medium w-28">Address</div>
                <div className="text-sm text-gray-600">123 Company Street</div>
              </div>
            </div>
          </div>
          
          {/* Documents */}
          <div>
            <h3 className="text-lg font-medium mb-3">Documents</h3>
            <div className="grid grid-cols-2 gap-3">
              {documentsData.map((doc, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-100 rounded-xl">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center mr-3",
                    doc.type === 'Contract' ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"
                  )}>
                    {doc.type === 'Contract' ? 'W' : 'R'}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{doc.type}</div>
                    <div className="text-xs text-gray-500">{doc.size}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Statistics */}
          <div>
            <h3 className="text-lg font-medium mb-3">Statistics</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">Business trips</span>
                  <span className="text-sm font-medium">{statisticsData.businessTrips} days</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-full bg-amber-400 rounded-full" 
                    style={{ width: `${(statisticsData.businessTrips / 100) * 100}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">Sickness</span>
                  <span className="text-sm font-medium">{statisticsData.sickness} days</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-full bg-gray-800 rounded-full" 
                    style={{ width: `${(statisticsData.sickness / 100) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EmployeeDetailsPanel;
