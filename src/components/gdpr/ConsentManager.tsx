
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Shield, Info } from 'lucide-react';
import { useGDPR } from '@/hooks/use-gdpr';

const ConsentManager = () => {
  const { consents, isLoading, updateConsent } = useGDPR();

  const consentTypes = [
    {
      type: 'necessary' as const,
      title: 'Necessary Cookies',
      description: 'Essential for the website to function properly. Cannot be disabled.',
      required: true
    },
    {
      type: 'functional' as const,
      title: 'Functional Cookies',
      description: 'Help us provide enhanced functionality and personalization.',
      required: false
    },
    {
      type: 'analytics' as const,
      title: 'Analytics Cookies',
      description: 'Help us understand how you use our website to improve user experience.',
      required: false
    },
    {
      type: 'marketing' as const,
      title: 'Marketing Cookies',
      description: 'Used to track visitors and display relevant ads and marketing content.',
      required: false
    }
  ];

  const getConsentStatus = (type: string) => {
    const consent = consents.find(c => c.consent_type === type);
    return consent?.consent_given || false;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          Cookie & Data Consent
        </CardTitle>
        <CardDescription>
          Manage your data processing consent preferences. You can change these settings at any time.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {consentTypes.map((item) => (
          <div key={item.type} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium">{item.title}</h4>
                {item.required && (
                  <Badge variant="secondary" className="text-xs">
                    Required
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
            <div className="ml-4">
              <Switch
                checked={item.required || getConsentStatus(item.type)}
                disabled={item.required || isLoading}
                onCheckedChange={(checked) => updateConsent(item.type, checked)}
              />
            </div>
          </div>
        ))}
        
        <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg mt-4">
          <Info className="h-4 w-4 text-blue-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900">About Your Data</p>
            <p className="text-blue-700">
              We process your data in accordance with GDPR regulations. You have the right to access, 
              rectify, port, and erase your personal data.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConsentManager;
