import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { useCreateAvailabilityRequest } from '@/hooks/availability/use-create-availability';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const FormSchema = z.object({
  date: z.date({
    required_error: "A date is required.",
  }),
  startTime: z.string().min(1, {
    message: "Start time is required",
  }),
  endTime: z.string().min(1, {
    message: "End time is required",
  }),
  isAvailable: z.boolean().default(true),
  notes: z.string().optional(),
})

interface AvailabilityFormData {
  date: Date;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  notes?: string;
}

interface NewAvailabilityRequest {
  employee_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  notes?: string;
}

interface AvailabilityRequestFormProps {
  employeeId: string;
  onSuccess?: () => void;
}

const AvailabilityRequestForm: React.FC<AvailabilityRequestFormProps> = ({ employeeId, onSuccess }) => {
  const { toast } = useToast();
  const { createRequest } = useCreateAvailabilityRequest();

  const form = useForm<AvailabilityFormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      date: new Date(),
      startTime: "09:00",
      endTime: "17:00",
      isAvailable: true,
      notes: "",
    },
  })

  const { reset } = form;

  const handleSubmit = async (data: AvailabilityFormData) => {
    try {
      // Convert to the format expected by the backend
      const requestData: NewAvailabilityRequest = {
        employee_id: employeeId,
        date: data.date.toISOString().split('T')[0],
        start_time: data.startTime,
        end_time: data.endTime,
        is_available: data.isAvailable,
        notes: data.notes
      };

      // Use the correct method from the hook
      const result = await createRequest(requestData);

      if (result.success) {
        reset();
        onSuccess?.();
      }
    } catch (error) {
      console.error('Error submitting availability request:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col space-y-1.5">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        field.value?.toLocaleDateString()
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex space-x-4">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem className="w-1/2">
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem className="w-1/2">
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="isAvailable"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Available</FormLabel>
              </div>
              <FormControl>
                <input
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="ml-4 h-5 w-5 rounded-sm border border-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                  type="checkbox"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any notes about your availability"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit Request</Button>
      </form>
    </Form>
  );
};

export default AvailabilityRequestForm;
