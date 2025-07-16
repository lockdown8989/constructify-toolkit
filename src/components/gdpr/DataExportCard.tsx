
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { useGDPR } from '@/hooks/use-gdpr';

const DataExportCard = () => {
  const { isLoading, exportUserData } = useGDPR();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5 text-green-600" />
          Export Your Data
        </CardTitle>
        <CardDescription>
          Download a copy of all your personal data in machine-readable format (JSON).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-green-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-green-900">What's included in your export:</p>
                <ul className="text-green-700 mt-1 space-y-1">
                  <li>• Profile information and account details</li>
                  <li>• Employment and attendance records</li>
                  <li>• Consent preferences and privacy settings</li>
                  <li>• Data processing audit logs</li>
                  <li>• Notification and communication history</li>
                </ul>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={exportUserData}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Preparing Export...' : 'Download My Data'}
          </Button>
          
          <p className="text-xs text-muted-foreground">
            The export will be downloaded as a JSON file. This process may take a few moments 
            for large datasets. You can request an export once every 24 hours.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataExportCard;
