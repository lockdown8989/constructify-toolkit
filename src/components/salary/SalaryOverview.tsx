
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, FileText, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useEmployees } from '@/hooks/use-employees';
import { useToast } from '@/components/ui/use-toast';
import { generatePayslipPDF } from '@/utils/exports/payslip-generator';

const SalaryOverview: React.FC = () => {
  const { user } = useAuth();
  const { data: employees = [] } = useEmployees();
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  // Find current employee data based on user ID
  const currentEmployee = employees.find(emp => emp.user_id === user?.id);

  const handleDownloadPDF = async () => {
    if (!currentEmployee) {
      toast({
        title: "Error",
        description: "Could not find your employee record",
        variant: "destructive"
      });
      return;
    }

    setIsDownloading(true);
    try {
      await generatePayslipPDF(currentEmployee, "current");
      toast({
        title: "Success",
        description: "Salary statement downloaded successfully",
        variant: "success"
      });
    } catch (error) {
      console.error("PDF download error:", error);
      toast({
        title: "Download Failed",
        description: "Could not generate PDF. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (!currentEmployee) {
    return (
      <div className="container py-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Salary Overview</h2>
          <p>Loading your salary information...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Salary</h1>
        <Button 
          onClick={handleDownloadPDF} 
          disabled={isDownloading}
          className="flex items-center gap-2"
        >
          {isDownloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Download PDF
        </Button>
      </div>
      
      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Salary Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Base Salary:</span>
                    <span className="font-medium">${currentEmployee.salary.toLocaleString()}</span>
                  </div>
                  {currentEmployee.hourly_rate && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Hourly Rate:</span>
                      <span className="font-medium">${currentEmployee.hourly_rate}/hr</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span className="font-medium">{currentEmployee.status}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Next Payment</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount:</span>
                    <span className="font-medium">${currentEmployee.salary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date:</span>
                    <span className="font-medium">25th of this month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Payment Method:</span>
                    <span className="font-medium">Direct Deposit</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Payment History</h3>
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">April {2023 - index}</p>
                    <p className="text-sm text-gray-500">Paid on 25th</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${currentEmployee.salary.toLocaleString()}</p>
                    <p className="text-sm text-green-600">Complete</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Salary Documents</h3>
            <div className="space-y-4">
              {[
                { name: "Annual Tax Statement", date: "Jan 15, 2023", type: "pdf" },
                { name: "Compensation Letter", date: "May 10, 2023", type: "pdf" },
                { name: "Bonus Structure", date: "Jun 22, 2023", type: "doc" }
              ].map((doc, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                  <div className="flex items-center">
                    <img 
                      src={doc.type === "pdf" ? "/pdf-icon.png" : "/word-icon.png"} 
                      alt={doc.type} 
                      className="w-8 h-8 mr-3" 
                    />
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-sm text-gray-500">{doc.date}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SalaryOverview;
