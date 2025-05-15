
import { supabase } from '../../integrations/supabase/client';
import { generatePayslipPDF, PayslipData } from '../../utils/exports/payslip-generator';
import { getEmployeeById } from '../../hooks/use-employees';
import { format } from 'date-fns';

// Generate payslip PDF for an employee
export const generateEmployeePayslip = async (employeeId: string, month?: string, year?: string) => {
  try {
    // Get employee data
    const employee = await getEmployeeById(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Format date for payslip
    const currentDate = new Date();
    const paymentMonth = month || format(currentDate, 'MMMM');
    const paymentYear = year || format(currentDate, 'yyyy');
    const paymentDate = `${paymentMonth} ${paymentYear}`;
    
    // Get overtime data (sample - in real application, this would come from a database)
    const overtimeHours = Math.floor(Math.random() * 20); // Sample overtime between 0-20 hours
    const contractualHours = 160; // Standard monthly hours (40h x 4 weeks)

    // Create payslip data
    const payslipData: PayslipData = {
      name: employee.name,
      title: employee.job_title || 'Employee',
      department: employee.department || 'General',
      salary: `$${employee.salary?.toLocaleString() || '0'}`,
      paymentDate: paymentDate,
      payPeriod: `${paymentMonth} ${paymentYear}`,
      overtimeHours: overtimeHours,
      contractualHours: contractualHours
    };
    
    // Generate PDF blob
    const pdfBlob = await generatePayslipPDF(payslipData);
    
    // Convert blob to file
    const pdfFile = new File([pdfBlob], `${employee.name.replace(/\s/g, '_')}_payslip_${paymentMonth}_${paymentYear}.pdf`, {
      type: 'application/pdf'
    });
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('payslips')
      .upload(`${employeeId}/${paymentYear}/${paymentMonth}/${pdfFile.name}`, pdfFile);
    
    if (error) {
      throw error;
    }
    
    // Create payslip record in database
    const { data: payslipData2, error: payslipError } = await supabase
      .from('payslips')
      .insert({
        employee_id: employeeId,
        month: paymentMonth,
        year: paymentYear,
        amount: employee.salary,
        status: 'generated',
        file_path: data.path,
        created_at: new Date().toISOString()
      });
    
    if (payslipError) {
      throw payslipError;
    }
    
    // Return success with path
    return {
      success: true,
      message: 'Payslip generated successfully',
      path: data?.path || null
    };
    
  } catch (error) {
    console.error('Error generating payslip:', error);
    return {
      success: false,
      message: `Error generating payslip: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Download payslip for an employee
export const downloadPayslip = async (employeeId: string, month: string, year: string) => {
  try {
    // Check if payslip exists in database
    const { data: payslips, error: fetchError } = await supabase
      .from('payslips')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('month', month)
      .eq('year', year)
      .single();
    
    if (fetchError || !payslips) {
      // Generate new payslip if not found
      const pdfResult = await generateEmployeePayslip(employeeId, month, year);
      if (!pdfResult || !pdfResult.success) {
        throw new Error(pdfResult?.error || 'Failed to generate payslip');
      }
      
      // Get public URL
      const { data: publicUrl } = await supabase.storage
        .from('payslips')
        .getPublicUrl(pdfResult.path || '');
      
      if (pdfResult && pdfResult.path) {
        return {
          success: true,
          message: 'Payslip downloaded successfully',
          url: publicUrl.publicUrl
        };
      }
      throw new Error('Failed to get public URL');
    }
    
    // Get existing payslip
    const { data: publicUrl } = await supabase.storage
      .from('payslips')
      .getPublicUrl(payslips.file_path);
    
    return {
      success: true,
      message: 'Existing payslip downloaded',
      url: publicUrl.publicUrl
    };
  } catch (error) {
    console.error('Error downloading payslip:', error);
    return {
      success: false,
      message: `Error downloading payslip: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
