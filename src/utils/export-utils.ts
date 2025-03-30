
/**
 * Utility functions for exporting data
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Converts data to CSV format and triggers a download
 * @param data Array of objects to convert to CSV
 * @param filename Name for the downloaded file
 * @param headers Optional custom headers (if not provided, will use object keys)
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  headers?: { [key in keyof T]?: string }
) {
  if (!data || data.length === 0) {
    console.error("No data to export");
    return;
  }

  // Get all keys from the first object
  const keys = Object.keys(data[0]) as Array<keyof T>;
  
  // Create header row using provided headers or object keys
  const headerRow = keys.map(key => headers?.[key] || String(key)).join(',');
  
  // Create data rows
  const rows = data.map(item => 
    keys.map(key => {
      // Handle values that might need escaping (commas, quotes, etc.)
      const value = item[key];
      const stringValue = value === null || value === undefined ? '' : String(value);
      
      // If value contains commas, quotes, or newlines, wrap in quotes
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',')
  );
  
  // Combine header and data rows
  const csvContent = [headerRow, ...rows].join('\n');
  
  // Create a download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates a formatted payslip PDF for an employee
 * @param employeeId Employee ID
 * @param employeeData Employee data to include in the payslip
 */
export async function generatePayslipPDF(
  employeeId: string,
  employeeData: {
    name: string;
    title: string;
    salary: string;
    department?: string;
    paymentDate?: string;
  }
) {
  const { name, title, salary, department, paymentDate } = employeeData;
  
  // Clean the salary string (removing $ and commas)
  const salaryNumeric = parseFloat(salary.replace(/\$|,/g, ''));
  
  // Calculate deductions
  const taxDeduction = salaryNumeric * 0.2;
  const insuranceDeduction = salaryNumeric * 0.05;
  const netSalary = salaryNumeric - taxDeduction - insuranceDeduction;
  
  // Format date
  const formattedDate = paymentDate || new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Create PDF
  const doc = new jsPDF();
  
  // Add company logo/header
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text("PAYSLIP", 105, 20, { align: 'center' });
  
  // Add date
  doc.setFontSize(10);
  doc.text(`Payment Date: ${formattedDate}`, 20, 30);
  
  // Add employee info
  doc.setFontSize(12);
  doc.text("Employee Information", 20, 40);
  
  const employeeInfo = [
    ["Employee Name:", name],
    ["Employee ID:", employeeId],
    ["Position:", title],
    ["Department:", department || "N/A"],
  ];
  
  autoTable(doc, {
    startY: 45,
    head: [],
    body: employeeInfo,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 1 },
    columnStyles: { 0: { cellWidth: 40 } }
  });
  
  // Add salary details
  doc.text("Salary Details", 20, doc.lastAutoTable?.finalY! + 10);
  
  const salaryDetails = [
    ["Gross Salary:", `$${salaryNumeric.toLocaleString()}`],
    ["Tax Deduction (20%):", `$${taxDeduction.toLocaleString()}`],
    ["Insurance (5%):", `$${insuranceDeduction.toLocaleString()}`],
    ["Net Salary:", `$${netSalary.toLocaleString()}`],
  ];
  
  autoTable(doc, {
    startY: doc.lastAutoTable?.finalY! + 15,
    head: [],
    body: salaryDetails,
    theme: 'striped',
    styles: { fontSize: 10, cellPadding: 1 },
    columnStyles: { 0: { cellWidth: 40 } }
  });
  
  // Add footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("This is an electronically generated document and does not require a signature.", 105, pageHeight - 10, { align: 'center' });
  
  // Generate filename
  const sanitizedName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const filename = `payslip_${sanitizedName}_${new Date().toISOString().split('T')[0]}`;
  
  // Save PDF
  doc.save(`${filename}.pdf`);
}

/**
 * Generates a formatted payslip CSV for an employee
 * @param employeeId Employee ID
 * @param employeeData Employee data to include in the payslip
 */
export async function generatePayslipCSV(
  employeeId: string,
  employeeData: {
    name: string;
    title: string;
    salary: string;
    department?: string;
    paymentDate?: string;
  }
) {
  const { name, title, salary, department, paymentDate } = employeeData;
  
  // Clean the salary string (removing $ and commas)
  const salaryNumeric = parseFloat(salary.replace(/\$|,/g, ''));
  
  // Calculate deductions
  const taxDeduction = salaryNumeric * 0.2;
  const insuranceDeduction = salaryNumeric * 0.05;
  const netSalary = salaryNumeric - taxDeduction - insuranceDeduction;
  
  // Format date
  const formattedDate = paymentDate || new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Create payslip data
  const payslipData = [
    {
      'Employee': name,
      'Employee ID': employeeId,
      'Position': title,
      'Department': department || 'N/A',
      'Payment Date': formattedDate,
      'Gross Salary': `$${salaryNumeric.toLocaleString()}`,
      'Tax Deduction (20%)': `$${taxDeduction.toLocaleString()}`,
      'Insurance (5%)': `$${insuranceDeduction.toLocaleString()}`,
      'Net Salary': `$${netSalary.toLocaleString()}`,
    }
  ];
  
  // Generate filename
  const sanitizedName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const filename = `payslip_${sanitizedName}_${new Date().toISOString().split('T')[0]}`;
  
  // Export to CSV
  exportToCSV(payslipData, filename, {
    'Employee': 'Employee Name',
    'Employee ID': 'Employee ID',
    'Position': 'Job Title',
    'Department': 'Department',
    'Payment Date': 'Payment Date',
    'Gross Salary': 'Gross Salary',
    'Tax Deduction (20%)': 'Tax Deduction (20%)',
    'Insurance (5%)': 'Insurance (5%)',
    'Net Salary': 'Net Salary'
  });
}
