import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { PayslipData } from '@/types/supabase/payroll';

// Function to generate payslip PDF
export const generatePayslipPDF = async (payslipData: PayslipData) => {
  const doc = new jsPDF();

  // Define header
  const header = (data: any) => {
    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.setFont('', 'bold');
    doc.text("Payslip", doc.internal.pageSize.getWidth() / 2, 10, {
      align: 'center'
    });
  };

  // Define footer
  const footer = (data: any) => {
    const pageCount = doc.internal.getNumberOfPages();
    doc.line(20, doc.internal.pageSize.getHeight() - 20, doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 20);
    doc.setFontSize(10);
    doc.setTextColor(40);
    doc.text(`Page ${data.pageNumber} of ${pageCount}`, doc.internal.pageSize.getWidth() - 30, doc.internal.pageSize.getHeight() - 10);
  };

  // Call header and footer on every page
  doc.autoTable({
    didDrawPage: (data) => {
      header(data);
      footer(data);
    },
  });

  // Payslip data
  const data = [
    [
      { content: 'Employee ID:', styles: { valign: 'middle', fontStyle: 'bold' } },
      { content: payslipData.employeeId, styles: { valign: 'middle' } }
    ],
    [
      { content: 'Employee Name:', styles: { valign: 'middle', fontStyle: 'bold' } },
      { content: payslipData.employeeName, styles: { valign: 'middle' } }
    ],
    [
      { content: 'Department:', styles: { valign: 'middle', fontStyle: 'bold' } },
      { content: payslipData.department, styles: { valign: 'middle' } }
    ],
    [
      { content: 'Position:', styles: { valign: 'middle', fontStyle: 'bold' } },
      { content: payslipData.position, styles: { valign: 'middle' } }
    ],
    [
      { content: 'Pay Period:', styles: { valign: 'middle', fontStyle: 'bold' } },
      { content: payslipData.payPeriod, styles: { valign: 'middle' } }
    ],
    [
      { content: 'Payment Date:', styles: { valign: 'middle', fontStyle: 'bold' } },
      { content: payslipData.paymentDate, styles: { valign: 'middle' } }
    ],
    [
      { content: 'Bank Account:', styles: { valign: 'middle', fontStyle: 'bold' } },
      { content: payslipData.bankAccount, styles: { valign: 'middle' } }
    ],
  ];

  // Define general styles
  const generalStyles = {
    font: 'helvetica',
    fontSize: 12,
    textColor: 40,
    cellPadding: 3,
  };

  // Table options
  const options = {
    startY: 30,
    useCss: false,
    styles: generalStyles,
    columnStyles: {
      0: { fontStyle: 'bold', textColor: 80 },
      1: { textColor: 60 },
    },
    margin: { horizontal: 20 },
  };

  // Function to add title with underline
  const addTitle = (doc: jsPDF, text: string, y: number) => {
    doc.setFontSize(14);
    doc.setFont('', 'bold');
    doc.setTextColor(40);
    doc.text(text, 20, y);
    const textWidth = doc.getTextWidth(text);
    doc.line(20, y + 2, 20 + textWidth, y + 2);
    return y + 10;
  };

  // Add payslip details table
  doc.autoTable({
    body: data,
    ...options,
  });

  let yPos = doc.autoTable.previous.finalY + 15;

  // Add title for earnings
  yPos = addTitle(doc, 'Earnings', yPos);

  // Earnings data
  const earningsData = [
    [
      { content: 'Base Salary:', styles: { valign: 'middle', fontStyle: 'bold' } },
      { content: `${payslipData.currency} ${payslipData.baseSalary}`, styles: { valign: 'middle' } }
    ],
    [
      { content: 'Overtime Pay:', styles: { valign: 'middle', fontStyle: 'bold' } },
      { content: `${payslipData.currency} ${payslipData.overtimePay}`, styles: { valign: 'middle' } }
    ],
    [
      { content: 'Bonus:', styles: { valign: 'middle', fontStyle: 'bold' } },
      { content: `${payslipData.currency} ${payslipData.bonus}`, styles: { valign: 'middle' } }
    ],
    [
      { content: 'Total Pay:', styles: { valign: 'middle', fontStyle: 'bold' } },
      { content: `${payslipData.currency} ${payslipData.totalPay}`, styles: { valign: 'middle' } }
    ],
  ];

  // Add earnings table
  doc.autoTable({
    body: earningsData,
    startY: yPos,
    margin: { horizontal: 20 },
    styles: generalStyles,
    columnStyles: {
      0: { fontStyle: 'bold', textColor: 80 },
      1: { textColor: 60 },
    },
  });

  yPos = doc.autoTable.previous.finalY + 15;

  // Add title for deductions
  yPos = addTitle(doc, 'Deductions', yPos);

  // Deductions data
  const deductionsData = [
    [
      { content: 'Deductions:', styles: { valign: 'middle', fontStyle: 'bold' } },
      { content: `${payslipData.currency} ${payslipData.deductions}`, styles: { valign: 'middle' } }
    ],
    [
      { content: 'Taxes:', styles: { valign: 'middle', fontStyle: 'bold' } },
      { content: `${payslipData.currency} ${payslipData.taxes}`, styles: { valign: 'middle' } }
    ],
    [
      { content: 'Net Pay:', styles: { valign: 'middle', fontStyle: 'bold' } },
      { content: `${payslipData.currency} ${payslipData.netPay}`, styles: { valign: 'middle' } }
    ],
  ];

  // Add deductions table
  doc.autoTable({
    body: deductionsData,
    startY: yPos,
    margin: { horizontal: 20 },
    styles: generalStyles,
    columnStyles: {
      0: { fontStyle: 'bold', textColor: 80 },
      1: { textColor: 60 },
    },
  });
  
  yPos = doc.autoTable.previous.finalY + 10;
  
  if (payslipData.notes) {
    doc.setFontSize(10);
    doc.text("Notes:", 20, yPos + 20);
    doc.text(payslipData.notes || "", 70, yPos + 20);
  }

  // Open the PDF in a new tab
  doc.output('pdfobjectnewwindow');
};
