
import { PayslipData } from '@/types/supabase/payroll';

// Add type definitions for jsPDF with autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: any; // Using 'any' to avoid TypeScript errors with finalY and previous
    getNumberOfPages: () => number;
  }
}

export interface PayslipSection {
  title: string;
  startY: number;
}

export interface PayslipTableResult {
  finalY?: number;
}

export type { PayslipData };
