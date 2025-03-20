
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const SalaryPage = () => {
  const navigate = useNavigate();

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Salary Management</h1>
      
      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h2 className="text-xl font-medium mb-4">Salary Management Tools</h2>
          <p className="text-gray-500 max-w-lg mb-8">
            Access detailed payroll management, salary reports, and compensation analytics through our comprehensive payroll dashboard.
          </p>
          
          <Button 
            onClick={() => navigate('/payroll')}
            className="flex items-center"
          >
            Go to Payroll Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SalaryPage;
