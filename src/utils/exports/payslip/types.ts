
import { PayslipData as BasePayslipData } from '@/types/supabase/payroll';

// Add type definitions for jsPDF with autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: Function;
    previousAutoTable?: {
      finalY?: number;
    };
    internal: {
      getNumberOfPages(): number;
    };
  }
}

export interface PayslipSection {
  title: string;
  startY: number;
}

export interface PayslipTableResult {
  finalY?: number;
}

export type { BasePayslipData as PayslipData };
