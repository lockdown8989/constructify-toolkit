import { addMonths, format } from 'date-fns';

export type PayrollPeriod = {
  key: string;
  label: string;
  start: Date;
  end: Date;
};

function getPeriodFor(date: Date): { start: Date; end: Date } {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed
  const day = date.getDate();

  if (day >= 26) {
    // 26 current month -> 25 next month
    return {
      start: new Date(year, month, 26),
      end: new Date(year, month + 1, 25),
    };
  } else {
    // 26 previous month -> 25 current month
    return {
      start: new Date(year, month - 1, 26),
      end: new Date(year, month, 25),
    };
  }
}

export function getPayrollPeriods(count: number = 6, anchorDate: Date = new Date()): PayrollPeriod[] {
  const periods: PayrollPeriod[] = [];
  for (let i = 0; i < count; i++) {
    const refDate = addMonths(anchorDate, -i);
    const { start, end } = getPeriodFor(refDate);
    const key = `${format(start, 'yyyy-MM-dd')}_${format(end, 'yyyy-MM-dd')}`;
    const label = `${format(start, 'dd MMM yyyy')} — ${format(end, 'dd MMM yyyy')}`;
    periods.push({ key, label, start, end });
  }
  return periods;
}
