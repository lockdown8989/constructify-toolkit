
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth Admin API key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    console.log('Starting monthly payslip generation...');
    
    // Get current month and year for payroll processing
    const today = new Date();
    const month = today.getMonth() + 1; // JavaScript months are 0-based
    const year = today.getFullYear();
    
    const monthStart = `${year}-${month.toString().padStart(2, '0')}-01`;
    const nextMonth = month === 12 ? 1 : month + 1;
    const yearOfNextMonth = month === 12 ? year + 1 : year;
    const nextMonthStart = `${yearOfNextMonth}-${nextMonth.toString().padStart(2, '0')}-01`;
    
    // Get all active employees
    const { data: employees, error: employeeError } = await supabaseAdmin
      .from('employees')
      .select('id, name, user_id, salary, department')
      .eq('status', 'Active');
      
    if (employeeError) {
      throw new Error(`Failed to fetch employees: ${employeeError.message}`);
    }
    
    console.log(`Found ${employees.length} active employees to process`);
    
    // Process each employee
    const results = [];
    for (const employee of employees) {
      try {
        // Get attendance data for the month
        const { data: attendanceData, error: attendanceError } = await supabaseAdmin
          .from('attendance')
          .select('working_minutes, overtime_minutes, attendance_status')
          .eq('employee_id', employee.id)
          .gte('date', monthStart)
          .lt('date', nextMonthStart);
          
        if (attendanceError) {
          throw new Error(`Failed to fetch attendance for employee ${employee.id}: ${attendanceError.message}`);
        }
        
        // Calculate attendance statistics
        let totalWorkingMinutes = 0;
        let totalOvertimeMinutes = 0;
        let absentDays = 0;
        let presentDays = 0;
        let leaveDays = 0;
        
        attendanceData.forEach(record => {
          totalWorkingMinutes += record.working_minutes || 0;
          totalOvertimeMinutes += record.overtime_minutes || 0;
          
          if (record.attendance_status === 'Absent') {
            absentDays += 1;
          } else if (record.attendance_status === 'Present' || record.attendance_status === 'Late' || record.attendance_status === 'Approved') {
            presentDays += 1;
          } else if (record.attendance_status === 'On Leave') {
            leaveDays += 1;
          }
        });
        
        // Calculate salary
        const totalWorkingHours = totalWorkingMinutes / 60;
        const totalOvertimeHours = totalOvertimeMinutes / 60;
        
        const baseSalary = employee.salary;
        const hourlyRate = baseSalary / 160; // Assuming 160 hours per month
        const overtimePay = totalOvertimeHours * hourlyRate * 1.5; // Overtime at 1.5x
        
        // Calculate deductions
        // Basic assumption: Each absent day reduces salary by daily rate
        const workDaysInMonth = 22; // Approximate working days in a month
        const dailyRate = baseSalary / workDaysInMonth;
        const absenceDeduction = absentDays * dailyRate;
        
        // Calculate taxes and other deductions (simplified)
        const taxRate = 0.2; // 20% tax rate
        const insuranceRate = 0.05; // 5% insurance
        const otherDeductionsRate = 0.03; // 3% other deductions
        
        const grossPay = baseSalary + overtimePay - absenceDeduction;
        const taxDeduction = grossPay * taxRate;
        const insuranceDeduction = grossPay * insuranceRate;
        const otherDeductions = grossPay * otherDeductionsRate;
        const totalDeductions = taxDeduction + insuranceDeduction + otherDeductions;
        
        // Calculate final net salary
        const netSalary = grossPay - totalDeductions;
        
        // Create or update payroll record
        const payrollDate = `${year}-${month.toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
        
        const { data: payrollData, error: payrollError } = await supabaseAdmin
          .from('payroll')
          .upsert({
            employee_id: employee.id,
            base_pay: baseSalary,
            working_hours: totalWorkingHours,
            overtime_hours: totalOvertimeHours,
            overtime_pay: overtimePay,
            salary_paid: netSalary,
            deductions: totalDeductions,
            tax_paid: taxDeduction,
            ni_contribution: insuranceDeduction,
            other_deductions: otherDeductions,
            payment_status: 'Paid',
            payment_date: payrollDate,
            processing_date: new Date().toISOString(),
            pay_period: `${monthStart} - ${nextMonthStart}`
          })
          .select();
          
        if (payrollError) {
          throw new Error(`Failed to create payroll record for employee ${employee.id}: ${payrollError.message}`);
        }
        
        // Send notification to the employee
        if (employee.user_id) {
          await supabaseAdmin
            .from('notifications')
            .insert({
              user_id: employee.user_id,
              title: 'Payslip Generated',
              message: `Your payslip for ${month}/${year} has been generated. Net salary: ${netSalary.toFixed(2)}`,
              type: 'success',
              related_entity: 'payroll',
              related_id: payrollData?.[0]?.id
            });
        }
        
        results.push({
          employee_id: employee.id,
          name: employee.name,
          success: true,
          net_salary: netSalary
        });
        
        console.log(`Successfully processed payroll for employee ${employee.name} (${employee.id})`);
      } catch (error) {
        console.error(`Error processing payroll for employee ${employee.id}:`, error);
        results.push({
          employee_id: employee.id,
          name: employee.name,
          success: false,
          error: error.message
        });
      }
    }
    
    // Create a payroll history record
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    await supabaseAdmin
      .from('payroll_history')
      .insert({
        employee_count: employees.length,
        success_count: successCount,
        fail_count: failCount,
        processed_by: 'system',
        employee_ids: employees.map(e => e.id),
        processing_date: new Date().toISOString()
      });
      
    console.log(`Payroll processing complete. Success: ${successCount}, Failed: ${failCount}`);

    return new Response(
      JSON.stringify({
        message: 'Payroll generation complete',
        processed: employees.length,
        success: successCount,
        failed: failCount,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in payroll processing:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
