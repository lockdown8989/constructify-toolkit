
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

const webhookFormSchema = z.object({
  webhookType: z.enum(['slack', 'email']),
  webhookUrl: z.string().url({ message: 'Please enter a valid URL' }),
  enableShiftSwaps: z.boolean(),
  enableAvailability: z.boolean(),
  enableLeave: z.boolean(),
  enableAttendance: z.boolean(),
});

type WebhookFormValues = z.infer<typeof webhookFormSchema>;

const WebhookConfig = () => {
  const { toast } = useToast();
  const { user, isAdmin, isManager, isHR } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<WebhookFormValues>({
    resolver: zodResolver(webhookFormSchema),
    defaultValues: {
      webhookType: 'slack',
      webhookUrl: '',
      enableShiftSwaps: true,
      enableAvailability: true,
      enableLeave: true,
      enableAttendance: true,
    },
  });
  
  // Load existing webhook settings
  React.useEffect(() => {
    if (!user) return;
    
    const loadWebhookSettings = async () => {
      const { data, error } = await supabase
        .from('webhook_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error loading webhook settings:', error);
        return;
      }
      
      if (data) {
        form.reset({
          webhookType: data.webhook_type,
          webhookUrl: data.webhook_url,
          enableShiftSwaps: data.notify_shift_swaps,
          enableAvailability: data.notify_availability,
          enableLeave: data.notify_leave,
          enableAttendance: data.notify_attendance,
        });
      }
    };
    
    loadWebhookSettings();
  }, [user, form]);
  
  const onSubmit = async (values: WebhookFormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // Test the webhook first
      const { error: testError } = await supabase.functions.invoke('send-webhook', {
        body: {
          webhookType: values.webhookType,
          webhookUrl: values.webhookUrl,
          title: 'Test Notification',
          message: 'This is a test notification to verify your webhook configuration.',
          data: {
            time: new Date().toISOString(),
            sender: user.email
          }
        }
      });
      
      if (testError) {
        console.error('Error testing webhook:', testError);
        toast({
          title: 'Webhook Test Failed',
          description: 'Could not send test notification to the specified webhook URL.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }
      
      // Save webhook settings
      const { error } = await supabase
        .from('webhook_settings')
        .upsert({
          user_id: user.id,
          webhook_type: values.webhookType,
          webhook_url: values.webhookUrl,
          notify_shift_swaps: values.enableShiftSwaps,
          notify_availability: values.enableAvailability,
          notify_leave: values.enableLeave,
          notify_attendance: values.enableAttendance,
        }, { onConflict: 'user_id' });
      
      if (error) {
        console.error('Error saving webhook settings:', error);
        toast({
          title: 'Error',
          description: 'Failed to save webhook settings. Please try again.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }
      
      toast({
        title: 'Webhook Configured',
        description: 'Your webhook settings have been saved successfully.',
      });
    } catch (error) {
      console.error('Webhook configuration error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isAdmin && !isManager && !isHR) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>External Notifications</CardTitle>
          <CardDescription>Configure external notification webhooks</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-muted-foreground">
            You don't have permission to configure webhooks. Please contact your administrator.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>External Notifications</CardTitle>
        <CardDescription>
          Configure webhooks to receive notifications on external platforms like Slack or email
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="webhookType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Notification Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="slack" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Slack
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="email" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Email (via webhook)
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormDescription>
                    {field.value === 'slack' 
                      ? 'You will need to create an incoming webhook in your Slack workspace.' 
                      : 'Use an email service webhook (like Zapier or Make.com)'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="webhookUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Webhook URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormDescription>
                    {form.watch('webhookType') === 'slack' 
                      ? 'Enter your Slack incoming webhook URL' 
                      : 'Enter the webhook URL for your email service'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Notification Settings</h3>
              
              <FormField
                control={form.control}
                name="enableShiftSwaps"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Shift Swaps</FormLabel>
                      <FormDescription>
                        Receive notifications about shift swap requests
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="enableAvailability"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Availability</FormLabel>
                      <FormDescription>
                        Receive notifications about availability updates
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="enableLeave"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Leave Requests</FormLabel>
                      <FormDescription>
                        Receive notifications about leave requests
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="enableAttendance"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Attendance</FormLabel>
                      <FormDescription>
                        Receive notifications about attendance issues
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Webhook Settings'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        <p>
          {form.watch('webhookType') === 'slack' 
            ? 'You can create a Slack incoming webhook in your Slack workspace settings.' 
            : 'You can use services like Zapier, Make.com, or n8n to create email webhooks.'}
        </p>
      </CardFooter>
    </Card>
  );
};

export default WebhookConfig;
