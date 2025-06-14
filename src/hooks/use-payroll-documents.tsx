
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function usePayrollDocuments() {
  return useQuery({
    queryKey: ['payroll-documents'],
    queryFn: async () => {
      const { data: payrollRecords, error } = await supabase
        .from('payroll')
        .select(`
          id,
          employee_id,
          document_url,
          document_name,
          payment_date,
          employees!inner(name, user_id)
        `)
        .not('document_url', 'is', null);
        
      if (error) {
        console.error('Error fetching payroll documents:', error);
        return [];
      }
      
      return payrollRecords || [];
    }
  });
}

export function useAttachPayslipToEmployee() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ 
      employeeId, 
      payslipFile, 
      paymentPeriod 
    }: { 
      employeeId: string; 
      payslipFile: File; 
      paymentPeriod: string;
    }) => {
      try {
        console.log("Uploading payslip for employee:", employeeId);
        
        // Format file path
        const timestamp = new Date().getTime();
        const fileName = `payslip_${paymentPeriod.replace(/[\/\s]/g, '_')}_${timestamp}.pdf`;
        const filePath = `${employeeId}/${fileName}`;
        
        // Upload file to storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('employee-documents')
          .upload(filePath, payslipFile, {
            cacheControl: '3600',
            upsert: true
          });
        
        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }
        
        console.log('Payslip uploaded successfully:', uploadData);
        
        // Get file size
        const sizeInBytes = payslipFile.size;
        const sizeString = sizeInBytes < 1024 * 1024
          ? `${Math.round(sizeInBytes / 1024)} KB`
          : `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('employee-documents')
          .getPublicUrl(filePath);
          
        console.log("Payslip public URL:", urlData.publicUrl);
        
        // Save document metadata
        const { data: docData, error: dbError } = await supabase
          .from('documents')
          .insert({
            employee_id: employeeId,
            name: fileName,
            title: `Payslip - ${paymentPeriod}`,
            category: 'payslip',
            document_type: 'payslip',
            path: filePath,
            url: urlData.publicUrl,
            size: sizeString,
            file_type: 'application/pdf'
          })
          .select()
          .single();
        
        if (dbError) {
          console.error('Database error:', dbError);
          // Clean up uploaded file if database insert fails
          await supabase.storage
            .from('employee-documents')
            .remove([filePath]);
          throw new Error(`Database error: ${dbError.message}`);
        }
        
        console.log("Payslip document metadata saved:", docData);
        
        return docData;
      } catch (error) {
        console.error("Error in attach payslip mutation:", error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employee-documents', variables.employeeId] });
      queryClient.invalidateQueries({ queryKey: ['payroll-documents'] });
      toast({
        title: "Payslip uploaded",
        description: "Payslip has been successfully attached to the employee.",
      });
    },
    onError: (error) => {
      console.error("Final error in payslip mutation:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload payslip",
        variant: "destructive"
      });
    }
  });
}
