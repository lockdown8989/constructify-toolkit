
import { PayslipData as BasePayslipData } from '@/types/supabase/payroll';

// Add type definitions for jsPDF with autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: Function & {
      previous?: {
        finalY?: number;
      }
    };
    previousAutoTable?: {
      finalY?: number;
    };
    internal: {
      getNumberOfPages(): number;
      events: any;
      scaleFactor: number;
      pageSize: { 
        width: number; 
        getWidth: () => number; 
        height: number; 
        getHeight: () => number; 
      };
      pages: number[];
      getEncryptor(objectId: number): (data: string) => string;
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
