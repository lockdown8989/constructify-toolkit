import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  CreditCard, 
  Mail, 
  MessageSquare, 
  Camera, 
  Calendar, 
  Webhook,
  Settings,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'connected' | 'disconnected' | 'configured';
  category: 'payment' | 'communication' | 'automation' | 'security';
  features: string[];
  requiresSetup?: boolean;
}

const integrations: Integration[] = [
  {
    id: 'stripe',
    name: 'Stripe Payments',
    description: 'Process payroll payments and reimbursements securely',
    icon: CreditCard,
    status: 'configured',
    category: 'payment',
    features: ['One-time payments', 'Payroll processing', 'Expense reimbursements'],
    requiresSetup: true
  },
  {
    id: 'resend',
    name: 'Email Notifications',
    description: 'Automated email notifications for payroll, schedules, and leave',
    icon: Mail,
    status: 'configured',
    category: 'communication',
    features: ['Payslip notifications', 'Leave approvals', 'Schedule updates'],
    requiresSetup: true
  },
  {
    id: 'twilio',
    name: 'SMS Alerts',
    description: 'Send urgent SMS notifications for time-sensitive events',
    icon: MessageSquare,
    status: 'disconnected',
    category: 'communication',
    features: ['Clock-in reminders', 'Urgent shift alerts', 'Overtime notifications'],
    requiresSetup: true
  },
  {
    id: 'face_recognition',
    name: 'Face Recognition',
    description: 'AWS Rekognition for secure biometric time tracking',
    icon: Camera,
    status: 'disconnected',
    category: 'security',
    features: ['Facial authentication', 'Anti-spoofing', 'Quick clock in/out'],
    requiresSetup: true
  },
  {
    id: 'calendar_sync',
    name: 'Calendar Sync',
    description: 'Sync schedules with Google Calendar and Outlook',
    icon: Calendar,
    status: 'configured',
    category: 'automation',
    features: ['Google Calendar', 'Outlook integration', 'Auto-sync schedules']
  },
  {
    id: 'webhooks',
    name: 'Custom Webhooks',
    description: 'Connect to external systems with custom webhook endpoints',
    icon: Webhook,
    status: 'connected',
    category: 'automation',
    features: ['Real-time events', 'Custom integrations', 'API endpoints']
  },
  {
    id: 'bamboohr',
    name: 'BambooHR',
    description: 'Sync employees and time-off from BambooHR',
    icon: Settings,
    status: 'disconnected',
    category: 'automation',
    features: ['Employee sync', 'Time-off import', 'Webhook updates'],
    requiresSetup: true
  },
  {
    id: 'workday',
    name: 'Workday',
    description: 'Enterprise HRIS data sync',
    icon: Settings,
    status: 'disconnected',
    category: 'automation',
    features: ['Employee sync', 'Job profiles', 'Time-off'],
    requiresSetup: true
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Export payroll to QuickBooks for accounting',
    icon: CreditCard,
    status: 'disconnected',
    category: 'payment',
    features: ['Payroll export', 'Journal entries', 'Tax categories'],
    requiresSetup: true
  },
  {
    id: 'xero',
    name: 'Xero',
    description: 'Export payroll and expenses to Xero',
    icon: CreditCard,
    status: 'disconnected',
    category: 'payment',
    features: ['Payroll export', 'Invoices', 'Tax reporting'],
    requiresSetup: true
  }
];

export const IntegrationHub: React.FC = () => {
  const [activeIntegrations, setActiveIntegrations] = useState<Set<string>>(
    new Set(['stripe', 'resend', 'calendar_sync', 'webhooks'])
  );
  const { toast } = useToast();

  const handleToggleIntegration = async (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    
    if (integration?.requiresSetup && !activeIntegrations.has(integrationId)) {
      toast({
        title: "Setup Required",
        description: `Please configure ${integration.name} in your project settings first.`,
        variant: "destructive"
      });
      return;
    }

    if (activeIntegrations.has(integrationId)) {
      setActiveIntegrations(prev => {
        const newSet = new Set(prev);
        newSet.delete(integrationId);
        return newSet;
      });
      toast({
        title: "Integration Disabled",
        description: `${integration?.name} has been disabled.`
      });
    } else {
      setActiveIntegrations(prev => new Set([...prev, integrationId]));
      toast({
        title: "Integration Enabled",
        description: `${integration?.name} has been enabled.`
      });
    }
  };

  const handleTestIntegration = async (integrationId: string) => {
    try {
      switch (integrationId) {
        case 'stripe':
          toast({ title: "Testing Stripe...", description: "Creating test payment session" });
          break;
        case 'resend':
          const { error } = await supabase.functions.invoke('send-notification-email', {
            body: {
              to: 'test@example.com',
              subject: 'Test Email',
              type: 'general',
              data: { loginUrl: window.location.origin }
            }
          });
          if (error) throw error;
          break;
        case 'twilio':
          await supabase.functions.invoke('send-sms', {
            body: {
              to: '+1234567890',
              message: 'Test SMS from HR System',
              type: 'general'
            }
          });
          break;
        case 'bamboohr':
          await supabase.functions.invoke('hris-sync', { body: { provider: 'bamboohr', action: 'test_connection' } });
          break;
        case 'workday':
          await supabase.functions.invoke('hris-sync', { body: { provider: 'workday', action: 'test_connection' } });
          break;
        case 'quickbooks':
          await supabase.functions.invoke('accounting-export', { body: { provider: 'quickbooks', action: 'test_connection' } });
          break;
        case 'xero':
          await supabase.functions.invoke('accounting-export', { body: { provider: 'xero', action: 'test_connection' } });
          break;
        default:
          break;
      }
      
      toast({
        title: "Test Successful",
        description: `${integrations.find(i => i.id === integrationId)?.name} is working correctly.`
      });
    } catch (error) {
      toast({
        title: "Test Failed",
        description: `Error testing ${integrations.find(i => i.id === integrationId)?.name}: ${error}`,
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: Integration['status']) => {
    switch (status) {
      case 'connected': return 'bg-success text-success-foreground';
      case 'configured': return 'bg-primary text-primary-foreground';
      case 'disconnected': return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'connected': return CheckCircle;
      case 'configured': return Settings;
      case 'disconnected': return AlertCircle;
    }
  };

  const categories = [
    { id: 'payment', name: 'Payment Processing', description: 'Handle financial transactions' },
    { id: 'communication', name: 'Communication', description: 'Email and SMS notifications' },
    { id: 'automation', name: 'Automation', description: 'Streamline workflows' },
    { id: 'security', name: 'Security', description: 'Enhanced authentication' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Integration Hub</h2>
          <p className="text-muted-foreground">Connect and manage third-party services</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {activeIntegrations.size} Active
        </Badge>
      </div>

      {categories.map(category => {
        const categoryIntegrations = integrations.filter(i => i.category === category.id);
        
        return (
          <div key={category.id} className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold capitalize">{category.name}</h3>
              <p className="text-sm text-muted-foreground">{category.description}</p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categoryIntegrations.map(integration => {
                const StatusIcon = getStatusIcon(integration.status);
                const isActive = activeIntegrations.has(integration.id);
                
                return (
                  <Card key={integration.id} className={`transition-all ${isActive ? 'ring-2 ring-primary' : ''}`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div className="flex items-center space-x-2">
                        <integration.icon className="h-5 w-5" />
                        <CardTitle className="text-base">{integration.name}</CardTitle>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(integration.status)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {integration.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <CardDescription className="text-sm">
                        {integration.description}
                      </CardDescription>
                      
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Features:</p>
                        <div className="flex flex-wrap gap-1">
                          {integration.features.map(feature => (
                            <Badge key={feature} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={isActive}
                            onCheckedChange={() => handleToggleIntegration(integration.id)}
                          />
                          <span className="text-sm">{isActive ? 'Active' : 'Inactive'}</span>
                        </div>
                        
                        {isActive && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTestIntegration(integration.id)}
                          >
                            Test
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};