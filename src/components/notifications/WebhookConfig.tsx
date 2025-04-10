import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WebhookSetting } from '@/types/supabase';

const formSchema = z.object({
  webhook_url: z.string().url({ message: "Please enter a valid URL" }),
  webhook_type: z.enum(['slack', 'email']),
  notify_shift_swaps: z.boolean().default(true),
  notify_availability: z.boolean().default(true),
  notify_leave: z.boolean().default(true),
  notify_attendance: z.boolean().default(false),
});

type WebhookFormValues = z.infer<typeof formSchema>;

const WebhookConfig = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<WebhookFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      webhook_url: '',
      webhook_type: 'slack',
      notify_shift_swaps: true,
      notify_availability: true,
      notify_leave: true,
      notify_attendance: false,
    },
  });
  
  useEffect(() => {
    if (!user) return;
    
    const loadWebhookSettings = async () => {
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('webhook_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error loading webhook settings:', error);
          toast({
            title: "Error",
            description: "Failed to load webhook settings",
            variant: "destructive",
          });
        }
        
        if (data) {
          const typedData = data as WebhookSetting;
          form.reset({
            webhook_url: typedData.webhook_url || '',
            webhook_type: typedData.webhook_type as 'slack' | 'email' || 'slack',
            notify_shift_swaps: typedData.notify_shift_swaps,
            notify_availability: typedData.notify_availability,
            notify_leave: typedData.notify_leave,
            notify_attendance: typedData.notify_attendance,
          });
        }
      } catch (error) {
        console.error('Error in loadWebhookSettings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadWebhookSettings();
  }, [user, form, toast]);
  
  const onSubmit = async (values: WebhookFormValues) => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.rpc('upsert_webhook_settings', {
        p_user_id: user.id,
        p_webhook_url: values.webhook_url,
        p_webhook_type: values.webhook_type,
        p_notify_shift_swaps: values.notify_shift_swaps,
        p_notify_availability: values.notify_availability,
        p_notify_leave: values.notify_leave,
        p_notify_attendance: values.notify_attendance,
        p_updated_at: new Date().toISOString()
      });
      
      if (error) {
        const { data: existingData } = await supabase
          .from('webhook_settings')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (existingData) {
          const { error: updateError } = await supabase
            .from('webhook_settings')
            .update({
              ...values,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', user.id);
            
          if (updateError) throw updateError;
        } else {
          const { error: insertError } = await supabase
            .from('webhook_settings')
            .insert({
              user_id: user.id,
              ...values,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            
          if (insertError) throw insertError;
        }
      }
      
      toast({
        title: "Success",
        description: "Webhook settings saved successfully",
      });
    } catch (error: any) {
      console.error('Error saving webhook settings:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save webhook settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>External Notifications</CardTitle>
        <CardDescription>
          Configure webhooks to receive notifications in Slack or via email.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="webhook_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Webhook Type</FormLabel>
                  <Select
                    disabled={isLoading}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select webhook type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="slack">Slack</SelectItem>
                      <SelectItem value="email">Email (Zapier/Integromat)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {field.value === 'slack' 
                      ? "Use a Slack incoming webhook URL" 
                      : "Use a webhook URL from Zapier, Make.com, or similar"}
                  </FormDescription>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="webhook_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Webhook URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://hooks.slack.com/services/xxx/yyy/zzz"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    {form.getValues('webhook_type') === 'slack' 
                      ? "Create this in Slack: Workspace settings > Integrations > Incoming Webhooks" 
                      : "Get this from your automation platform (Zapier, Make.com, etc)"}
                  </FormDescription>
                </FormItem>
              )}
            />
            
            <div className="space-y-4 pt-4">
              <h3 className="text-sm font-medium">Notification types</h3>
              
              <FormField
                control={form.control}
                name="notify_shift_swaps"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Shift Swap Updates</FormLabel>
                      <FormDescription>
                        Notify me about shift swap requests and approvals
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notify_availability"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Availability Changes</FormLabel>
                      <FormDescription>
                        Notify me about availability request updates
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notify_leave"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Leave Requests</FormLabel>
                      <FormDescription>
                        Notify me about leave request updates and approvals
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notify_attendance"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Attendance Updates</FormLabel>
                      <FormDescription>
                        Notify me about attendance tracking events
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Settings"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default WebhookConfig;
