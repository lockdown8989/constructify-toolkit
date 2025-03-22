import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useAddEmployee } from '@/hooks/use-employees';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Define form schema with validation
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  job_title: z.string().min(2, { message: 'Job title is required' }),
  department: z.string().min(1, { message: 'Department is required' }),
  site: z.string().min(1, { message: 'Site is required' }),
  salary: z.coerce.number().min(1, { message: 'Salary must be greater than 0' }),
  lifecycle: z.string().default('Active'),
  status: z.string().default('Active'),
});

type FormValues = z.infer<typeof formSchema>;

interface AddEmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments: string[];
  sites: string[];
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  open,
  onOpenChange,
  departments = [],
  sites = [],
}) => {
  const addEmployee = useAddEmployee();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      job_title: '',
      department: '',
      site: '',
      salary: 0,
      lifecycle: 'Active',
      status: 'Active',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await addEmployee.mutateAsync({
        name: values.name,
        job_title: values.job_title,
        department: values.department,
        site: values.site,
        salary: Number(values.salary),
        start_date: new Date().toISOString(),
        lifecycle: values.lifecycle,
        status: values.status,
      });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Error adding employee:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogDescription>
            Enter the details of the new employee. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="job_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Software Engineer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.length > 0 ? (
                          departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))
                        ) : (
                          <>
                            <SelectItem value="Engineering">Engineering</SelectItem>
                            <SelectItem value="Design">Design</SelectItem>
                            <SelectItem value="Marketing">Marketing</SelectItem>
                            <SelectItem value="Product">Product</SelectItem>
                            <SelectItem value="Sales">Sales</SelectItem>
                            <SelectItem value="Finance">Finance</SelectItem>
                            <SelectItem value="HR">HR</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="site"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sites.length > 0 ? (
                          sites.map((site) => (
                            <SelectItem key={site} value={site}>
                              {site}
                            </SelectItem>
                          ))
                        ) : (
                          <>
                            <SelectItem value="HQ - San Francisco">HQ - San Francisco</SelectItem>
                            <SelectItem value="New York Office">New York Office</SelectItem>
                            <SelectItem value="Remote - US">Remote - US</SelectItem>
                            <SelectItem value="Remote - International">Remote - International</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="salary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Annual Salary (USD)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="65000" 
                      {...field} 
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addEmployee.isPending}>
                {addEmployee.isPending ? "Adding..." : "Add Employee"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployeeModal;
