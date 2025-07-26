
export interface ConflictBucket {
  shift_id?: string;
  score: number;
  violations: ConflictViolation[];
}

export interface ConflictViolation {
  type: 'hard' | 'soft';
  rule: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface HeatmapData {
  buckets: Record<string, Record<string, ConflictBucket>>;
  meta: {
    maxScore: number;
    weekStart: string;
    weekEnd: string;
  };
}

export interface ConflictRule {
  id: string;
  name: string;
  type: 'hard' | 'soft';
  weight: number;
  threshold: number;
  description: string;
}

export interface ScheduleConflictEngine {
  calculateConflicts(weekStart: Date, weekEnd: Date): Promise<HeatmapData>;
  getConflictRules(): ConflictRule[];
  validateShift(employeeId: string, startTime: Date, endTime: Date): ConflictViolation[];
}
