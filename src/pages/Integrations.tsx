import React from 'react';
import { IntegrationHub } from '@/components/integrations/IntegrationHub';
import { PaymentIntegration } from '@/components/integrations/PaymentIntegration';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

export default function Integrations() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
          <p className="text-muted-foreground">
            Connect your HR system with external services
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="setup">Setup Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <IntegrationHub />
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <PaymentIntegration />
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Payment Features</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Secure payment processing via Stripe</li>
                  <li>• Support for payroll, reimbursements, and bonuses</li>
                  <li>• Multi-currency support (GBP, EUR, USD)</li>
                  <li>• Automatic payment receipts</li>
                  <li>• Integration with payroll system</li>
                  <li>• PCI DSS compliant</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Integration Setup Guide</h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold">1. Stripe Payments</h4>
                    <p className="text-sm text-muted-foreground">
                      Configure STRIPE_SECRET_KEY in project secrets for payment processing.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold">2. Email Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Add RESEND_API_KEY for automated email notifications.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold">3. SMS Alerts</h4>
                    <p className="text-sm text-muted-foreground">
                      Configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold">4. Face Recognition</h4>
                    <p className="text-sm text-muted-foreground">
                      Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_REGION for facial authentication.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}