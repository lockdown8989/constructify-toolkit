
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle, Info } from 'lucide-react';
import ConsentManager from './ConsentManager';
import DataExportCard from './DataExportCard';
import DataProcessingLog from './DataProcessingLog';

const GDPRDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Shield className="h-8 w-8 text-blue-600" />
          Privacy & Data Protection
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Manage your privacy preferences, data consent, and exercise your rights under GDPR regulations.
        </p>
      </div>

      {/* GDPR Rights Information */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Info className="h-5 w-5" />
            Your Data Protection Rights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-blue-900 mb-2">You have the right to:</h4>
              <ul className="space-y-1 text-blue-800">
                <li>• Access your personal data</li>
                <li>• Rectify incorrect data</li>
                <li>• Erase your data (right to be forgotten)</li>
                <li>• Port your data to another service</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Additional rights:</h4>
              <ul className="space-y-1 text-blue-800">
                <li>• Restrict processing of your data</li>
                <li>• Object to data processing</li>
                <li>• Withdraw consent at any time</li>
                <li>• Lodge a complaint with authorities</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <ConsentManager />
          <DataExportCard />
        </div>
        <div>
          <DataProcessingLog />
        </div>
      </div>

      {/* Footer Notice */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-orange-900">Important Notice</p>
              <p className="text-orange-800">
                For data deletion, anonymization, or other privacy requests not available through this interface, 
                please contact our Data Protection Officer at privacy@teampulse.com. We will respond within 30 days 
                as required by GDPR.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GDPRDashboard;
